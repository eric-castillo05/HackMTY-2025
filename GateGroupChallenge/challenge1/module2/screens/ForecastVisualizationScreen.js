import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../shared/theme/colors';

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
      background-color: #FAFAFA;
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
        color: '#010165',
        width: 3
      },
      marker: {
        size: 6,
        color: '#010165'
      },
      fill: 'tozeroy',
      fillcolor: 'rgba(1, 1, 101, 0.1)'
    };

    const layout = {
      title: {
        text: 'Forecast: ${productId}',
        font: { size: 18, color: '#1A1A1A' }
      },
      xaxis: {
        title: 'Date',
        type: 'date',
        tickformat: '%b %d',
        tickangle: -45,
        gridcolor: '#E5E7EB'
      },
      yaxis: {
        title: 'Quantity Consumed',
        gridcolor: '#E5E7EB'
      },
      plot_bgcolor: '#FFFFFF',
      paper_bgcolor: '#FAFAFA',
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
    <SafeAreaView style={styles.safeArea}>
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
                <Text style={[styles.metricValue, { color: colors.success }]}>
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
            placeholderTextColor={colors.textLight}
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
            <ActivityIndicator size="large" color={colors.primary} />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  metricsContainer: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginTop: spacing.md,
    ...shadows.sm,
  },
  metricsTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
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
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  metricLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginTop: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: colors.surface,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FFF3CD',
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  errorText: {
    color: '#8B4513',
    fontSize: fontSize.md,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  loadingText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontSize: fontSize.md,
  },
  chartContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginTop: spacing.md,
    ...shadows.sm,
  },
  chartTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  chartWrapper: {
    height: 420,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  statsContainer: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  statsTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  statLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  emptyHint: {
    fontSize: fontSize.sm,
    color: colors.disabled,
  },
});
