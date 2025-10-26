from datetime import timedelta
from typing import List

import numpy as np
import pandas as pd

pipe: Pipeline = None
SHEET_NAME = None  # None = primera hoja
COL_DATE   = "Date"
COL_PRODUCT= "Product_ID"
COL_TARGET = "Quantity_Consumed"
EXCEL_PATH = "flaskr/utils/predict.xlsx"
LAGS  = [1, 7, 28]
ROLLS = [7, 28]

HORIZON_DAYS = 28
ROUND_OUTPUTS = True
NON_NEGATIVE  = True
class model2Service:

    def __init__(self):
        pass

    def add_lags_and_rolls(self, data: pd.DataFrame,
                           key_col: str,
                           date_col: str,
                           target_col: str,
                           lags: List[int],
                           rolls: List[int]) -> pd.DataFrame:
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

    def forecast_recursive_all_features(self, original_df: pd.DataFrame,
                                        model: Pipeline,
                                        key_col: str,
                                        date_col: str,
                                        target_col: str,
                                        lags: List[int],
                                        rolls: List[int],
                                        horizon_days: int,
                                        feature_cols: list,
                                        round_outputs: bool = True,
                                        non_negative: bool = True) -> pd.DataFrame:
        """
        Genera H pasos hacia adelante por producto, preservando TODAS las columnas
        de entrenamiento (feature_cols). Se parte de la última fila conocida de cada
        producto y se actualizan fechas y lags/rollings.
        """
        hist = original_df.sort_values([key_col, date_col]).copy()
        last_full_per_prod = hist.groupby(key_col).tail(1).copy()

        max_mem = max(max(lags), max(rolls)) + 1
        buffers, last_dates = {}, {}
        for pid, grp in hist.groupby(key_col):
            grp = grp.sort_values(date_col)
            buffers[pid] = grp[target_col].tolist()[-max_mem:]
            last_dates[pid] = grp[date_col].max()

        future = []
        for step in range(1, horizon_days + 1):
            rows = []
            for pid in last_dates:
                base = last_full_per_prod[last_full_per_prod[key_col] == pid].iloc[-1].copy()
                d = last_dates[pid] + timedelta(days=step)

                row = {c: np.nan for c in feature_cols}

                # copiar exógenas del base
                for c in feature_cols:
                    if c in base.index:
                        row[c] = base[c]

                # engineered de fecha si existen
                if "year" in row:       row["year"] = d.year
                if "month" in row:      row["month"] = d.month
                if "day" in row:        row["day"] = d.day
                if "dow" in row:        row["dow"] = d.weekday()
                if "weekofyear" in row: row["weekofyear"] = int(d.isocalendar().week)
                if "quarter" in row:    row["quarter"] = (d.month - 1) // 3 + 1

                # lags/rolls si están en features
                buf = buffers[pid]
                for l in lags:
                    k = f"lag_{l}"
                    if k in row:
                        row[k] = buf[-l] if len(buf) >= l else np.nan
                for w in rolls:
                    k = f"rollmean_{w}"
                    if k in row:
                        w_len = min(w, len(buf))
                        row[k] = float(np.mean(buf[-w_len:])) if w_len > 0 else np.nan

                if key_col in row:
                    row[key_col] = pid

                rows.append(row)

            Xh = pd.DataFrame(rows, columns=feature_cols)
            yh = model.predict(Xh)

            if round_outputs:
                yh = np.rint(yh)
            if non_negative:
                yh = np.maximum(yh, 0)
            yh_int = yh.astype(int)

            step_df = pd.DataFrame({
                date_col: [last_dates[pid] + timedelta(days=step) for pid in last_dates],
                key_col: list(last_dates.keys()),
                "y_pred": yh_int
            })
            future.append(step_df)

            # actualizar buffers con predichos enteros
            for i, pid in enumerate(last_dates):
                buffers[pid].append(float(yh_int[i]))
                if len(buffers[pid]) > max_mem:
                    buffers[pid] = buffers[pid][-max_mem:]

        return pd.concat(future, ignore_index=True).sort_values([key_col, date_col])

    def train_and_build_forecast(self) -> tuple:
        """
        Entrena el pipeline global y construye el forecast global.
        Devuelve: (pipe, feature_cols, forecast_df, metrics_dict)
        """
        excel_path = Path(EXCEL_PATH).expanduser().resolve()

        # 1) carga
        if SHEET_NAME is None:
            df = pd.read_excel(excel_path)
        else:
            df = pd.read_excel(excel_path, sheet_name=SHEET_NAME)

        df.columns = [str(c).strip() for c in df.columns]
        df[COL_DATE] = pd.to_datetime(df[COL_DATE], errors="coerce")
        df = df.dropna(subset=[COL_DATE, COL_PRODUCT, COL_TARGET]).reset_index(drop=True)
        df = df.sort_values([COL_PRODUCT, COL_DATE]).reset_index(drop=True)

        # 2) lags/rolls
        df = self.add_lags_and_rolls(df, COL_PRODUCT, COL_DATE, COL_TARGET, LAGS, ROLLS)

        # 3) calendario
        df["year"] = df[COL_DATE].dt.year
        df["month"] = df[COL_DATE].dt.month
        df["day"] = df[COL_DATE].dt.day
        df["dow"] = df[COL_DATE].dt.dayofweek
        df["weekofyear"] = df[COL_DATE].dt.isocalendar().week.astype(int)
        df["quarter"] = df[COL_DATE].dt.quarter

        need_cols_local = [f"lag_{l}" for l in LAGS] + [f"rollmean_{w}" for w in ROLLS]
        df_model = df.dropna(subset=need_cols_local + [COL_TARGET]).copy()

        # 4) split temporal
        df_model = df_model.sort_values([COL_DATE, COL_PRODUCT]).reset_index(drop=True)

        X = df_model.drop(columns=[COL_TARGET, COL_DATE])
        y = df_model[COL_TARGET].astype(float)
        feat_cols = X.columns.tolist()

        # tipos
        cat_cols, num_cols = [], []
        for c in feat_cols:
            if pd.api.types.is_numeric_dtype(X[c]):
                num_cols.append(c)
            else:
                cat_cols.append(c)

        n = len(df_model)
        test_size = max(1, int(n * 0.20))
        train_idx = np.arange(0, n - test_size)
        test_idx = np.arange(n - test_size, n)
        X_train, y_train = X.iloc[train_idx], y.iloc[train_idx]
        X_test, y_test = X.iloc[test_idx], y.iloc[test_idx]

        # 5) pipeline + modelo
        try:
            ohe = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
        except TypeError:
            ohe = OneHotEncoder(handle_unknown="ignore", sparse=False)

        preprocess = ColumnTransformer(
            transformers=[
                ("num", SimpleImputer(strategy="median"), num_cols),
                ("cat", Pipeline([
                    ("imp", SimpleImputer(strategy="most_frequent")),
                    ("oh", ohe)
                ]), cat_cols),
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

        # 6) métricas (salida entera)
        pred_test = pl.predict(X_test)
        if ROUND_OUTPUTS:
            pred_test = np.rint(pred_test)
        if NON_NEGATIVE:
            pred_test = np.maximum(pred_test, 0)
        pred_test_int = pred_test.astype(int)

        mae = mean_absolute_error(y_test, pred_test_int)
        rmse = float(np.sqrt(mean_squared_error(y_test, pred_test_int)))
        r2 = r2_score(y_test, pred_test_int)

        metrics = {"MAE": float(mae), "RMSE": float(rmse), "R2": float(r2),
                   "n_train": int(len(X_train)), "n_test": int(len(X_test))}

        # 7) forecast global
        # Asegurar/crear columnas faltantes para original_df
        df_model_local = df_model.copy()
        for c in feat_cols:
            if c not in df_model_local.columns:
                df_model_local[c] = np.nan

        original_df = df_model_local[[c for c in
                                      set([COL_PRODUCT, COL_DATE, COL_TARGET] + feat_cols + ["year", "month", "day",
                                                                                             "dow", "weekofyear",
                                                                                             "quarter"]) if
                                      c in df_model_local.columns]].copy()

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

        # guardar globales
        return pl, feat_cols, forecast, metrics, need_cols_local
