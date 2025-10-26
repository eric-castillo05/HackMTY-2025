# app.py (PRODUCCIÓN: listo para Gunicorn/Waitress)
# ============================================================
# Expone DOS servicios:
# 1) /forecast_predict?product_id=SNK001[&format=csv]
#    - Usa un MODELO ENTRENADO AL INICIAR (global, con lags/rollings por Product_ID)
#    - Devuelve el subset del forecast global ordenado por [Product_ID, Date]
#
# 2) /forecast_predict_group?path_file=/ruta/al/archivo.xlsx[&horizon=14]
#    - Usa un MODELO CARGADO DESDE .joblib (pipeline de features Flight_ID/Product_ID + calendario)
#    - Lee el archivo, arma el futuro a H días y regresa el JSON de future_df
#
# Salud:
#    /health  -> estado y métricas del modelo global + estado del modelo joblib
#
# Ejecuta en producción, por ejemplo:
#   gunicorn -w 4 -k gthread --threads 2 --timeout 120 -b 0.0.0.0:5001 app:app
#
# Variables de entorno útiles:
#   EXCEL_PATH, SHEET_NAME, COL_DATE, COL_PRODUCT, COL_TARGET, HORIZON_DAYS,
#   ROUND_OUTPUTS(0/1), NON_NEGATIVE(0/1), ENABLE_CORS(0/1),
#   MODEL_PATH (para el joblib del endpoint /forecast_predict_group)
# ============================================================

import os
import json
from pathlib import Path
from typing import List, Optional

import numpy as np
import pandas as pd
from datetime import timedelta
from flask import Flask, request, jsonify, Response
from flask_cors import CORS

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.ensemble import HistGradientBoostingRegressor
from joblib import load

import warnings
warnings.filterwarnings('ignore')

# ========= PARÁMETROS MODELO GLOBAL (entrenado al iniciar) =========
EXCEL_PATH = os.environ.get(
    "EXCEL_PATH",
    "[HackMTY2025]_ConsumptionPrediction_Dataset_v1.xlsx"
)
SHEET_NAME = os.environ.get("SHEET_NAME")  # None => primera hoja
COL_DATE   = os.environ.get("COL_DATE", "Date")
COL_PRODUCT= os.environ.get("COL_PRODUCT", "Product_ID")
COL_TARGET = os.environ.get("COL_TARGET", "Quantity_Consumed")

# lags/rollings del modelo global
LAGS  = [1, 7, 28]
ROLLS = [7, 28]

HORIZON_DAYS  = int(os.environ.get("HORIZON_DAYS", "28"))
ROUND_OUTPUTS = os.environ.get("ROUND_OUTPUTS", "1") == "1"
NON_NEGATIVE  = os.environ.get("NON_NEGATIVE", "1") == "1"

# ========= PARÁMETROS MODELO JOBLIB (endpoint group) =========
MODEL_PATH = os.environ.get("MODEL_PATH", "pipeline_consumption_hgbt.joblib")

COL_FLIGHT = "Flight_ID"                # usado por el pipeline joblib
COL_PROD   = "Product_ID"               # (coincide con COL_PRODUCT)
COL_SSQ    = "Standard_Specification_Qty"
COL_RET    = "Quantity_Returned"
COL_TARGET_GROUP = "Quantity_Consumed"  # puede no estar en el archivo nuevo

FEATURE_COLS_GROUP = [
    COL_FLIGHT, COL_PROD,
    COL_SSQ, COL_RET,
    "year","month","day","dow","weekofyear","quarter"
]

# ========= ESTADO GLOBAL =========
pipe_global: Pipeline = None                  # modelo entrenado al iniciar
feature_cols_global: list = None
forecast_df_global: pd.DataFrame = None
metrics_global: dict = {}
need_cols_global: list = None

pipe_joblib: Optional[Pipeline] = None        # modelo joblib (para /forecast_predict_group)

ENABLE_CORS = os.environ.get("ENABLE_CORS", "1") == "1"

# ========= UTILIDADES COMUNES =========
def add_lags_and_rolls(
    data: pd.DataFrame,
    key_col: str,
    date_col: str,
    target_col: str,
    lags: List[int],
    rolls: List[int]
) -> pd.DataFrame:
    data = data.copy()
    for l in lags:
        data[f"lag_{l}"] = data.groupby(key_col)[target_col].shift(l)
    for w in rolls:
        data[f"rollmean_{w}"] = (
            data.groupby(key_col)[target_col]
                .shift(1)
                .rolling(window=w, min_periods=1)
                .mean()
        )
    return data

def forecast_recursive_all_features(
    original_df: pd.DataFrame,
    model: Pipeline,
    key_col: str,
    date_col: str,
    target_col: str,
    lags: List[int],
    rolls: List[int],
    horizon_days: int,
    feature_cols: list,
    round_outputs: bool = True,
    non_negative: bool = True
) -> pd.DataFrame:
    """Forecast H pasos por key_col; actualiza fechas y lags/rollings."""
    hist = original_df.sort_values([key_col, date_col]).copy()
    last_full_per_key = hist.groupby(key_col).tail(1).copy()

    max_mem = max(max(lags), max(rolls)) + 1
    buffers, last_dates = {}, {}
    for k, grp in hist.groupby(key_col):
        grp = grp.sort_values(date_col)
        buffers[k] = grp[target_col].tolist()[-max_mem:]
        last_dates[k] = grp[date_col].max()

    future = []
    for step in range(1, horizon_days + 1):
        rows = []
        for k in last_dates:
            base = last_full_per_key[last_full_per_key[key_col] == k].iloc[-1].copy()
            d = last_dates[k] + timedelta(days=step)

            row = {c: np.nan for c in feature_cols}
            for c in feature_cols:
                if c in base.index:
                    row[c] = base[c]

            if "year" in row:       row["year"] = d.year
            if "month" in row:      row["month"] = d.month
            if "day" in row:        row["day"] = d.day
            if "dow" in row:        row["dow"] = d.weekday()
            if "weekofyear" in row: row["weekofyear"] = int(d.isocalendar().week)
            if "quarter" in row:    row["quarter"] = (d.month - 1)//3 + 1

            buf = buffers[k]
            for l in lags:
                col = f"lag_{l}"
                if col in row:
                    row[col] = buf[-l] if len(buf) >= l else np.nan
            for w in rolls:
                col = f"rollmean_{w}"
                if col in row:
                    w_len = min(w, len(buf))
                    row[col] = float(np.mean(buf[-w_len:])) if w_len > 0 else np.nan

            if key_col in row:
                row[key_col] = k

            rows.append(row)

        Xh = pd.DataFrame(rows, columns=feature_cols)
        yh = model.predict(Xh)
        if round_outputs:
            yh = np.rint(yh)
        if non_negative:
            yh = np.maximum(yh, 0)
        yh_int = yh.astype(int)

        step_df = pd.DataFrame({
            date_col: [last_dates[k] + timedelta(days=step) for k in last_dates],
            key_col:  list(last_dates.keys()),
            "y_pred": yh_int
        })
        future.append(step_df)

        for i, k in enumerate(last_dates):
            buffers[k].append(float(yh_int[i]))
            if len(buffers[k]) > max_mem:
                buffers[k] = buffers[k][-max_mem:]

    return pd.concat(future, ignore_index=True).sort_values([key_col, date_col])

def add_calendar_feats(ddf: pd.DataFrame, date_col: str) -> pd.DataFrame:
    ddf = ddf.copy()
    ddf[date_col] = pd.to_datetime(ddf[date_col], errors="coerce")
    ddf["year"]       = ddf[date_col].dt.year
    ddf["month"]      = ddf[date_col].dt.month
    ddf["day"]        = ddf[date_col].dt.day
    ddf["dow"]        = ddf[date_col].dt.dayofweek
    ddf["weekofyear"] = ddf[date_col].dt.isocalendar().week.astype(int)
    ddf["quarter"]    = ddf[date_col].dt.quarter
    return ddf

def load_table_any(path: Path) -> pd.DataFrame:
    """Lee .xlsx/.xls con read_excel, .csv/.txt con read_csv; fallback si falla."""
    suffix = path.suffix.lower()
    if suffix in [".xlsx", ".xls"]:
        return pd.read_excel(path)
    elif suffix in [".csv", ".txt"]:
        return pd.read_csv(path)
    else:
        try:
            return pd.read_excel(path)
        except Exception:
            return pd.read_csv(path)

def ensure_required_columns(df: pd.DataFrame, required: List[str]) -> Optional[List[str]]:
    missing = [c for c in required if c not in df.columns]
    return missing if len(missing) > 0 else None

def med_lastk(df_base: pd.DataFrame, mask, col: str, k: int = 28) -> Optional[float]:
    sub = df_base[mask].sort_values(COL_DATE).tail(k)
    vals = pd.to_numeric(sub[col], errors="coerce").dropna()
    return float(vals.median()) if len(vals) else None

# ========= ENTRENAMIENTO GLOBAL AL IMPORTAR =========
def train_and_build_forecast() -> tuple:
    """Entrena pipeline global y construye forecast global por Product_ID."""
    excel_path = Path(EXCEL_PATH).expanduser().resolve()
    df = pd.read_excel(excel_path) if SHEET_NAME is None else pd.read_excel(excel_path, sheet_name=SHEET_NAME)

    df.columns = [str(c).strip() for c in df.columns]
    df[COL_DATE] = pd.to_datetime(df[COL_DATE], errors="coerce")
    df = df.dropna(subset=[COL_DATE, COL_PRODUCT, COL_TARGET]).reset_index(drop=True)
    df = df.sort_values([COL_PRODUCT, COL_DATE]).reset_index(drop=True)

    df = add_lags_and_rolls(df, COL_PRODUCT, COL_DATE, COL_TARGET, LAGS, ROLLS)

    df["year"]       = df[COL_DATE].dt.year
    df["month"]      = df[COL_DATE].dt.month
    df["day"]        = df[COL_DATE].dt.day
    df["dow"]        = df[COL_DATE].dt.dayofweek
    df["weekofyear"] = df[COL_DATE].dt.isocalendar().week.astype(int)
    df["quarter"]    = df[COL_DATE].dt.quarter

    need_cols_local = [f"lag_{l}" for l in LAGS] + [f"rollmean_{w}" for w in ROLLS]
    df_model = df.dropna(subset=need_cols_local + [COL_TARGET]).copy()
    df_model = df_model.sort_values([COL_DATE, COL_PRODUCT]).reset_index(drop=True)

    X = df_model.drop(columns=[COL_TARGET, COL_DATE])
    y = df_model[COL_TARGET].astype(float)
    feat_cols = X.columns.tolist()

    cat_cols, num_cols = [], []
    for c in feat_cols:
        (num_cols if pd.api.types.is_numeric_dtype(X[c]) else cat_cols).append(c)

    n = len(df_model)
    test_size = max(1, int(n * 0.20))
    train_idx = np.arange(0, n - test_size)
    test_idx  = np.arange(n - test_size, n)
    X_train, y_train = X.iloc[train_idx], y.iloc[train_idx]
    X_test,  y_test  = X.iloc[test_idx],  y.iloc[test_idx]

    try:
        ohe = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    except TypeError:
        ohe = OneHotEncoder(handle_unknown="ignore", sparse=False)

    preprocess = ColumnTransformer(
        transformers=[
            ("num", SimpleImputer(strategy="median"), num_cols),
            ("cat", Pipeline([("imp", SimpleImputer(strategy="most_frequent")),
                              ("oh", ohe)]), cat_cols),
        ],
        remainder="drop"
    )

    reg = HistGradientBoostingRegressor(
        learning_rate=0.03,
        max_iter=600,
        early_stopping=True,
        validation_fraction=0.1,
        n_iter_no_change=50,
        min_samples_leaf=10,
        l2_regularization=0.001,
        max_depth=None,
        random_state=42
    )

    pl = Pipeline([("prep", preprocess), ("reg", reg)])
    pl.fit(X_train, y_train)

    pred_test = pl.predict(X_test)
    if ROUND_OUTPUTS:
        pred_test = np.rint(pred_test)
    if NON_NEGATIVE:
        pred_test = np.maximum(pred_test, 0)
    pred_test_int = pred_test.astype(int)

    mae  = mean_absolute_error(y_test, pred_test_int)
    rmse = float(np.sqrt(mean_squared_error(y_test, pred_test_int)))
    r2   = r2_score(y_test, pred_test_int)

    metrics = {"MAE": float(mae), "RMSE": float(rmse), "R2": float(r2),
               "n_train": int(len(X_train)), "n_test": int(len(X_test))}

    df_model_local = df_model.copy()
    for c in feat_cols:
        if c not in df_model_local.columns:
            df_model_local[c] = np.nan

    original_df = df_model_local[[c for c in set([COL_PRODUCT, COL_DATE, COL_TARGET] + feat_cols + ["year","month","day","dow","weekofyear","quarter"]) if c in df_model_local.columns]].copy()

    forecast = forecast_recursive_all_features(
        original_df=original_df,
        model=pl,
        key_col=COL_PRODUCT,
        date_col=COL_DATE,
        target_col=COL_TARGET,
        lags=LAGS,
        rolls=ROLLS,
        horizon_days=HORIZON_DAYS,
        feature_cols=feat_cols,
        round_outputs=ROUND_OUTPUTS,
        non_negative=NON_NEGATIVE
    )

    return pl, feat_cols, forecast, metrics, need_cols_local

# ========= CARGA MODELOS AL IMPORTAR (una sola vez por proceso WSGI) =========
# Modelo global entrenado
try:
    pipe_global, feature_cols_global, forecast_df_global, metrics_global, need_cols_global = train_and_build_forecast()
    print("[i] Modelo GLOBAL entrenado y forecast preparado.")
    print("[i] Métricas GLOBAL:", metrics_global)
except Exception as e:
    print("[X] Error al entrenar modelo GLOBAL:", e)
    raise

# Modelo joblib (para /forecast_predict_group)
try:
    pipe_joblib = load(MODEL_PATH)
    print(f"[i] Modelo JOBLIB cargado desde: {MODEL_PATH}")
except Exception as e:
    print(f"[!] No se pudo cargar el modelo joblib: {e}")
    pipe_joblib = None

# ========= FLASK APP =========
app = Flask(__name__)
if ENABLE_CORS:
    CORS(app)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "global_model_trained": pipe_global is not None,
        "global_metrics": metrics_global,
        "joblib_loaded": pipe_joblib is not None,
        "model_path": MODEL_PATH
    })

# -------- Servicio 1: forecast por producto usando forecast GLOBAL --------
# http://127.0.0.1:5001/forecast_predict?product_id=SNK001
@app.route("/forecast_predict", methods=["GET"])
def forecast_predict():
    """
    Parámetros:
      - product_id (obligatorio): ID del producto a consultar
      - format (opcional): 'json' (default) o 'csv'
    Retorna subset ordenado por [Product_ID, Date] del forecast global.
    """
    product_id = request.args.get("product_id", type=str)
    out_fmt    = request.args.get("format", default="json", type=str)

    if not product_id:
        return jsonify({"error": "Falta parámetro 'product_id'"}), 400

    if forecast_df_global is None or forecast_df_global.empty:
        return jsonify({"error": "Forecast global no disponible"}), 500

    subset = forecast_df_global[forecast_df_global[COL_PRODUCT] == product_id].copy()
    subset = subset.sort_values([COL_PRODUCT, COL_DATE])

    if subset.empty:
        return jsonify({"product_id": product_id, "rows": 0, "data": []})

    if out_fmt.lower() == "csv":
        csv_data = subset.to_csv(index=False)
        return Response(
            csv_data,
            mimetype="text/csv",
            headers={"Content-Disposition": f"attachment; filename=forecast_{product_id}.csv"}
        )
    else:
        data = json.loads(subset.to_json(orient="records", date_format="iso"))
        return jsonify({"product_id": product_id, "rows": len(subset), "data": data})

# -------- Servicio 2: forecast H días desde archivo usando PIPELINE JOBLIB --------
# http://127.0.0.1:5000/forecast_predict_group?path_file=/Users/luisjose/Downloads/HackMTY2025_ChallengeDimensions/02_ConsumptionPrediction/predict.xlsx
@app.route("/forecast_predict_group", methods=["GET"])
def forecast_predict_group():
    """
    Parámetros:
      - path_file (obligatorio): ruta absoluta al archivo con datos nuevos (Excel/CSV)
      - horizon   (opcional)   : días a pronosticar (default 14)
    Devuelve:
      - JSON con el contenido de future_df (forecast para pares presentes en la última fecha)
    Requiere que el pipeline esté cargado desde MODEL_PATH (pipe_joblib).
    """
    if pipe_joblib is None:
        return jsonify({"error": f"Modelo joblib no cargado. Ajusta MODEL_PATH (actual: '{MODEL_PATH}')"}), 500

    path_file = request.args.get("path_file", type=str)
    horizon   = request.args.get("horizon", default=14, type=int)

    if not path_file:
        return jsonify({"error": "Falta el parámetro 'path_file'."}), 400

    try:
        excel_path = Path(path_file).expanduser().resolve()
        if not excel_path.exists():
            return jsonify({"error": f"No existe el archivo: {excel_path}"}), 400

        df_new = load_table_any(excel_path)

        need_inputs = [COL_FLIGHT, COL_DATE, COL_PROD, COL_SSQ, COL_RET]
        missing = ensure_required_columns(df_new, need_inputs)
        if missing:
            return jsonify({"error": f"Faltan columnas requeridas: {missing}"}), 400

        df_new = df_new.copy()
        df_new[COL_DATE] = pd.to_datetime(df_new[COL_DATE], errors="coerce")
        df_new[COL_SSQ]  = pd.to_numeric(df_new[COL_SSQ], errors="coerce")
        df_new[COL_RET]  = pd.to_numeric(df_new[COL_RET], errors="coerce")
        df_new = df_new.dropna(subset=[COL_DATE, COL_FLIGHT, COL_PROD, COL_SSQ, COL_RET]).reset_index(drop=True)

        if df_new.empty:
            return jsonify({"rows": 0, "data": []})

        last_date = df_new[COL_DATE].max()
        pairs = (df_new[df_new[COL_DATE] == last_date][[COL_FLIGHT, COL_PROD]]
                 .drop_duplicates()
                 .reset_index(drop=True))

        global_ssq = float(np.median(df_new[COL_SSQ].dropna())) if df_new[COL_SSQ].notna().any() else 0.0
        global_ret = float(np.median(df_new[COL_RET].dropna())) if df_new[COL_RET].notna().any() else 0.0

        rows = []
        for _, r in pairs.iterrows():
            fid, pid = r[COL_FLIGHT], r[COL_PROD]
            m_pair = (df_new[COL_FLIGHT] == fid) & (df_new[COL_PROD] == pid)
            m_prod = (df_new[COL_PROD] == pid)

            ssq = med_lastk(df_new, m_pair, COL_SSQ, 28)
            if ssq is None:
                ssq = med_lastk(df_new, m_prod, COL_SSQ, 28)
            ssq = ssq if ssq is not None else global_ssq

            ret = med_lastk(df_new, m_pair, COL_RET, 28)
            if ret is None:
                ret = med_lastk(df_new, m_prod, COL_RET, 28)
            ret = ret if ret is not None else global_ret

            for h in range(1, horizon + 1):
                d = last_date + timedelta(days=h)
                rows.append({COL_DATE: d, COL_FLIGHT: fid, COL_PROD: pid, COL_SSQ: ssq, COL_RET: ret})

        future_df = pd.DataFrame(rows)
        if future_df.empty:
            return jsonify({"rows": 0, "data": []})

        future_df = add_calendar_feats(future_df, COL_DATE)
        X_future = future_df[FEATURE_COLS_GROUP].copy()
        y_future = pipe_joblib.predict(X_future)
        if ROUND_OUTPUTS:
            y_future = np.rint(y_future)
        if NON_NEGATIVE:
            y_future = np.maximum(y_future, 0)
        future_df["Quantity_Consumed_pred"] = y_future.astype(int)

        data = json.loads(future_df.to_json(orient="records", date_format="iso"))
        return jsonify({"rows": len(future_df), "data": data})

    except Exception as e:
        return jsonify({"error": f"Fallo al procesar: {str(e)}"}), 500

# NOTA: no usar app.run() aquí. Servir con Gunicorn/Waitress en producción.
