# app.py
# ===============================================
# Flask API: Cargar modelo .joblib y hacer forecast desde archivo proporcionado
# - Modelo global: se carga al iniciar el servidor
# - Endpoint: /forecast_predict_group?path_file=/ruta/al/archivo.xlsx[&horizon=14]
#   Lee el archivo, arma features y devuelve en JSON el future_df (forecast)
# ===============================================

import os
import json
from pathlib import Path
from datetime import timedelta
from typing import List, Optional

import numpy as np
import pandas as pd
from flask import Flask, request, jsonify

from joblib import load

# ------------------- Config global -------------------
MODEL_PATH = "pipeline_consumption_hgbt.joblib"

# Columnas (deben coincidir con el entrenamiento)
COL_DATE   = "Date"
COL_FLIGHT = "Flight_ID"
COL_PROD   = "Product_ID"
COL_SSQ    = "Standard_Specification_Qty"
COL_RET    = "Quantity_Returned"
COL_TARGET = "Quantity_Consumed"  # puede no existir en el archivo nuevo

# Flags de salida
ROUND_OUTPUT = True        # redondear a enteros
NON_NEGATIVE = True        # truncar negativos a 0

# Las features de entrada que la pipeline espera (las mismas del entrenamiento)
FEATURE_COLS = [
    COL_FLIGHT, COL_PROD,            # categóricas
    COL_SSQ, COL_RET,                # numéricas
    "year","month","day","dow","weekofyear","quarter"  # calendario
]

# ------------------- Utilidades -------------------
def add_calendar_feats(ddf: pd.DataFrame, date_col: str = COL_DATE) -> pd.DataFrame:
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
    """Lee .xlsx/.xls con read_excel, .csv con read_csv (inferiendo sep por defecto)."""
    suffix = path.suffix.lower()
    if suffix in [".xlsx", ".xls"]:
        return pd.read_excel(path)
    elif suffix in [".csv", ".txt"]:
        return pd.read_csv(path)
    else:
        # intento final: read_excel
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

# ------------------- Cargar modelo global -------------------
try:
    pipe = load(MODEL_PATH)
    print(f"[i] Modelo cargado desde: {MODEL_PATH}")
except Exception as e:
    print(f"[X] No pude cargar el modelo: {e}")
    pipe = None

# ------------------- Flask app -------------------
app = Flask(__name__)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok" if pipe is not None else "model_not_loaded",
        "model_path": MODEL_PATH
    })

@app.route("/forecast_predict_group", methods=["GET"])
def forecast_predict_group():
    """
    Parámetros (query):
      - path_file (obligatorio): ruta absoluta al archivo con datos nuevos (Excel/CSV)
      - horizon  (opcional)    : días a pronosticar (default 14)
    Devuelve:
      - JSON con el contenido de future_df (forecast para pares presentes en la última fecha)
    """
    if pipe is None:
        return jsonify({"error": "Modelo no cargado en el servidor."}), 500

    path_file = request.args.get("path_file", type=str)
    horizon   = request.args.get("horizon", default=14, type=int)

    if not path_file:
        return jsonify({"error": "Falta el parámetro 'path_file'."}), 400

    try:
        excel_path = Path(path_file).expanduser().resolve()
        if not excel_path.exists():
            return jsonify({"error": f"No existe el archivo: {excel_path}"}), 400

        df_new = load_table_any(excel_path)

        # Validar columnas
        need_inputs = [COL_FLIGHT, COL_DATE, COL_PROD, COL_SSQ, COL_RET]
        missing = ensure_required_columns(df_new, need_inputs)
        if missing:
            return jsonify({"error": f"Faltan columnas requeridas: {missing}"}), 400

        # Tipos y limpieza mínima
        df_new = df_new.copy()
        df_new[COL_DATE] = pd.to_datetime(df_new[COL_DATE], errors="coerce")
        df_new[COL_SSQ]  = pd.to_numeric(df_new[COL_SSQ], errors="coerce")
        df_new[COL_RET]  = pd.to_numeric(df_new[COL_RET], errors="coerce")
        df_new = df_new.dropna(subset=[COL_DATE, COL_FLIGHT, COL_PROD, COL_SSQ, COL_RET]).reset_index(drop=True)

        # -------- Scoring opcional (si quieres devolver también pred de filas presentes) --------
        # df_scoring = add_calendar_feats(df_new, COL_DATE)
        # X_new = df_scoring[FEATURE_COLS].copy()
        # y_hat = pipe.predict(X_new)
        # if ROUND_OUTPUT:  y_hat = np.rint(y_hat)
        # if NON_NEGATIVE:  y_hat = np.maximum(y_hat, 0)
        # df_scoring["Quantity_Consumed_pred"] = y_hat.astype(int)

        # ---------------- Forecast H días desde la última fecha ----------------
        if df_new.empty:
            return jsonify({"rows": 0, "data": []})

        last_date = df_new[COL_DATE].max()

        # pares (Flight_ID, Product_ID) presentes en la última fecha
        pairs = (df_new[df_new[COL_DATE] == last_date][[COL_FLIGHT, COL_PROD]]
                 .drop_duplicates()
                 .reset_index(drop=True))

        # Medianas proxy de SSQ y Returned
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
        X_future = future_df[FEATURE_COLS].copy()
        y_future = pipe.predict(X_future)
        if ROUND_OUTPUT:
            y_future = np.rint(y_future)
        if NON_NEGATIVE:
            y_future = np.maximum(y_future, 0)
        future_df["Quantity_Consumed_pred"] = y_future.astype(int)

        # Regresar JSON de future_df
        data = json.loads(future_df.to_json(orient="records", date_format="iso"))
        return jsonify({"rows": len(future_df), "data": data})

    except Exception as e:
        return jsonify({"error": f"Fallo al procesar: {str(e)}"}), 500

if __name__ == "__main__":
    # Ejecutar:  python app.py
    # Probar:    http://127.0.0.1:5002/forecast_predict_group?path_file=/Users/luisjose/Downloads/HackMTY2025_ChallengeDimensions/02_ConsumptionPrediction/predict.xlsx
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5002)))
