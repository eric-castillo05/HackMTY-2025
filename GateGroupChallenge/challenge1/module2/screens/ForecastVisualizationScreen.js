import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';

const API_BASE_URL = 'https://antique-www-reggae-integrity.trycloudflare.com';

export const ForecastVisualizationScreen = () => {
  const [productId, setProductId] = useState('SNK001');
  const [forecastData, setForecastData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load health metrics
      const healthResponse = await fetch(`${API_BASE_URL}/health`);
      const healthData = await healthResponse.json();
      setMetrics(healthData.global_metrics);

      // Load forecast data
      await loadForecast(productId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadForecast = async (pid) => {
    try {
      const response = await fetch(`${API_BASE_URL}/forecast_predict?product_id=${pid}`);
      const data = await response.json();
      setForecastData(data);
    } catch (err) {
      setError('Error loading forecast: ' + err.message);
    }
  };

  const generatePlotlyHTML = () => {
    if (!forecastData || !forecastData.data) return '';

    const dates = forecastData.data.map(d => d.Date.split('T')[0]);
    const predictions = forecastData.data.map(d => d.y_pred);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 10px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f5f5f5;
    }
    #chart {
      width: 100%;
      height: 400px;
    }
  </style>
</head>
<body>
  <div id="chart"></div>
  <script>
    const dates = ${JSON.stringify(dates)};
    const predictions = ${JSON.stringify(predictions)};

    const trace = {
      x: dates,
      y: predictions,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Predicted Consumption',
      line: {
        color: '#2196F3',
        width: 3
      },
      marker: {
        size: 6,
        color: '#2196F3'
      },
      fill: 'tozeroy',
      fillcolor: 'rgba(33, 150, 243, 0.1)'
    };

    const layout = {
      title: {
        text: 'Forecast: ${productId}',
        font: { size: 18, color: '#333' }
      },
      xaxis: {
        title: 'Date',
        type: 'date',
        tickformat: '%b %d',
        tickangle: -45,
        gridcolor: '#e0e0e0'
      },
      yaxis: {
        title: 'Quantity Consumed',
        gridcolor: '#e0e0e0'
      },
      plot_bgcolor: '#ffffff',
      paper_bgcolor: '#f5f5f5',
      margin: { l: 50, r: 30, t: 60, b: 80 },
      hovermode: 'x unified',
      showlegend: true,
      legend: {
        x: 0,
        y: 1.1,
        orientation: 'h'
      }
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
    };

    Plotly.newPlot('chart', [trace], layout, config);
  </script>
</body>
</html>
    `;
  };

  const handleSearch = () => {
    if (productId.trim()) {
      loadForecast(productId.trim());
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Consumption Forecast</Text>
        <Text style={styles.subtitle}>ML-based predictions powered by HGBT</Text>
      </View>

      {/* Model Metrics */}
      {metrics && (
        <View style={styles.metricsContainer}>
          <Text style={styles.metricsTitle}>Model Performance</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{metrics.MAE.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>MAE</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{metrics.RMSE.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>RMSE</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#4CAF50' }]}>
                {(metrics.R2 * 100).toFixed(1)}%
              </Text>
              <Text style={styles.metricLabel}>R² Score</Text>
            </View>
          </View>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter Product ID (e.g., SNK001)"
          value={productId}
          onChangeText={setProductId}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading forecast data...</Text>
        </View>
      )}

      {/* Chart */}
      {!loading && forecastData && forecastData.data && forecastData.data.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            📊 {forecastData.rows} days forecast for {forecastData.product_id}
          </Text>
          <View style={styles.chartWrapper}>
            <WebView
              originWhitelist={['*']}
              source={{ html: generatePlotlyHTML() }}
              style={styles.webview}
              scrollEnabled={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          </View>
        </View>
      )}

      {/* Statistics */}
      {!loading && forecastData && forecastData.data && forecastData.data.length > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Forecast Statistics</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Average Daily:</Text>
            <Text style={styles.statValue}>
              {(forecastData.data.reduce((sum, d) => sum + d.y_pred, 0) / forecastData.data.length).toFixed(1)} units
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Max Consumption:</Text>
            <Text style={styles.statValue}>
              {Math.max(...forecastData.data.map(d => d.y_pred))} units
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Min Consumption:</Text>
            <Text style={styles.statValue}>
              {Math.min(...forecastData.data.map(d => d.y_pred))} units
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Forecasted:</Text>
            <Text style={styles.statValue}>
              {forecastData.data.reduce((sum, d) => sum + d.y_pred, 0)} units
            </Text>
          </View>
        </View>
      )}

      {/* Empty State */}
      {!loading && (!forecastData || !forecastData.data || forecastData.data.length === 0) && !error && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>📈 No forecast data available</Text>
          <Text style={styles.emptyHint}>Try searching for a different product ID</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  metricsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 16,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricCard: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA726',
  },
  errorText: {
    color: '#8B4513',
    fontSize: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 12,
    fontSize: 15,
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  chartWrapper: {
    height: 420,
    borderRadius: 8,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 15,
    color: '#666',
  },
  statValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#bbb',
  },
});
