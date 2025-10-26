import json

from sklearn.pipeline import Pipeline
from flask import jsonify, app, Response, request
import pandas as pd


pipe: Pipeline = None
feature_cols: list = None
forecast_df: pd.DataFrame = None
metrics_dict: dict = {}
COLS_NEED = None

SHEET_NAME = None  # None = primera hoja
COL_DATE   = "Date"
COL_PRODUCT= "Product_ID"
COL_TARGET = "Quantity_Consumed"

# lags/rollings
LAGS  = [1, 7, 28]
ROLLS = [7, 28]

HORIZON_DAYS = 28
ROUND_OUTPUTS = True
NON_NEGATIVE  = True


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model_trained": pipe is not None, "metrics": metrics_dict})

@app.route("/forecast_predict", methods=["GET"])
def forecast_predict():
    """
    Parámetros:
      - product_id (obligatorio): ID del producto a consultar
      - format (opcional): 'json' (default) o 'csv'
    Retorna:
      subset ordenado por [Product_ID, Date]
    """
    product_id = request.args.get("product_id", type=str)
    out_fmt    = request.args.get("format", default="json", type=str)

    if not product_id:
        return jsonify({"error": "Falta parámetro 'product_id'"}), 400

    if forecast_df is None or forecast_df.empty:
        return jsonify({"error": "Forecast no disponible"}), 500

    subset = forecast_df[forecast_df[COL_PRODUCT] == product_id].copy()
    subset = subset.sort_values([COL_PRODUCT, COL_DATE])

    if subset.empty:
        return jsonify({"product_id": product_id, "rows": 0, "data": []})

    if out_fmt.lower() == "csv":
        # devolver CSV como texto
        csv_data = subset.to_csv(index=False)
        return Response(
            csv_data,
            mimetype="text/csv",
            headers={"Content-Disposition": f"attachment; filename=forecast_{product_id}.csv"}
        )
    else:
        # JSON con fechas ISO
        data = json.loads(subset.to_json(orient="records", date_format="iso"))
        return jsonify({"product_id": product_id, "rows": len(subset), "data": data})

@app.route("/metrics", methods=["GET"])
def metrics():
    return jsonify(metrics_dict)
