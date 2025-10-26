# Forecast Visualization Module

This module provides an interactive visualization of consumption forecasts using Plotly charts.

## Features

- **Interactive Plotly Charts**: View 28-day consumption forecasts with interactive zoom, pan, and hover features
- **Model Metrics Display**: See real-time MAE, RMSE, and R² scores from the ML model
- **Product Search**: Search and visualize forecasts for any Product ID
- **Statistics Panel**: View key statistics like average daily consumption, max/min values, and total forecasted

## API Integration

The screen consumes data from the Flask backend (`app.py`):

- **Endpoint**: `https://antique-www-reggae-integrity.trycloudflare.com/forecast_predict?product_id=<PRODUCT_ID>`
- **Health Check**: `https://antique-www-reggae-integrity.trycloudflare.com/health`

### API Response Format

```json
{
  "product_id": "SNK001",
  "rows": 28,
  "data": [
    {
      "Date": "2025-10-08T00:00:00.000",
      "Product_ID": "SNK001",
      "y_pred": 39
    },
    ...
  ]
}
```

## Usage

1. Navigate to **Module 2** from the drawer menu
2. The screen loads with default product `SNK001`
3. View the interactive Plotly chart showing forecast data
4. Use the search bar to query different Product IDs
5. Interact with the chart:
   - **Zoom**: Click and drag on the chart
   - **Pan**: Hold shift and drag
   - **Hover**: See exact values on hover
   - **Reset**: Double-click to reset view

## Model Performance

The screen displays key model metrics:
- **MAE** (Mean Absolute Error): ~3.52
- **RMSE** (Root Mean Squared Error): ~5.77
- **R² Score**: 98.6% (excellent predictive accuracy)

## Components

### ForecastVisualizationScreen
Main screen component that:
- Fetches data from the API
- Generates Plotly HTML dynamically
- Renders charts using WebView
- Displays statistics and metrics

### Technologies Used
- **React Native WebView**: For rendering HTML/JS Plotly charts
- **Plotly.js**: Interactive charting library
- **Flask Backend**: Provides ML-based forecast predictions

## Installation

The required dependencies are already installed:
```bash
npm install react-native-webview
```

## Backend Requirements

Ensure the Flask backend is running and accessible:
```bash
# Start the backend
gunicorn -w 4 -k gthread --threads 2 --timeout 120 -b 0.0.0.0:5001 app:app
```

Or use cloudflare tunnel for remote access:
```bash
cloudflared tunnel --url http://localhost:5001
```

## Example Product IDs

Try these Product IDs:
- SNK001
- SNK002
- BEV001
- MEAL-HOT-001

## Troubleshooting

**Chart not loading?**
- Check that the backend API is accessible
- Verify the Product ID exists in the dataset
- Check network connectivity

**Empty data?**
- The product might not have forecast data
- Try a different Product ID
- Check API health endpoint

## Future Enhancements

- [ ] Multiple product comparison
- [ ] Historical vs predicted overlay
- [ ] Export chart as image
- [ ] Custom date range selection
- [ ] Confidence intervals display
