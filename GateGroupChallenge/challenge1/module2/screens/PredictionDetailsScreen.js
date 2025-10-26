import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { FreshnessChart } from '../components/FreshnessChart';
import { HistoryTable, DataTable } from '../components/DataTable';
import { PredictionService } from '../services/predictionService';

export const PredictionDetailsScreen = ({ route }) => {
  const { prediction, demandPrediction } = route.params;
  const [detailedData, setDetailedData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prediction.id) {
      loadDetailedPrediction();
    }
  }, [prediction.id]);

  const loadDetailedPrediction = async () => {
    try {
      setLoading(true);
      const data = await PredictionService.getPredictionById(prediction.id);
      setDetailedData(data);
    } catch (error) {
      console.error('Error loading detailed prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 50) return '#FF9800';
    return '#F44336';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.productName}>{prediction.productName || prediction.sku}</Text>
        <View 
          style={[
            styles.scoreContainer, 
            { backgroundColor: getScoreColor(prediction.predictabilityScore || prediction.freshnessScore || 0) }
          ]}
        >
          <Text style={styles.scoreText}>
            {prediction.predictabilityScore || prediction.freshnessScore || 0}%
          </Text>
          <Text style={styles.scoreLabel}>
            {prediction.predictabilityScore ? 'Predictability' : 'Freshness'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>SKU:</Text>
          <Text style={styles.infoValue}>{prediction.sku || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Category:</Text>
          <Text style={styles.infoValue}>{prediction.category || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Location:</Text>
          <Text style={styles.infoValue}>{prediction.location || 'N/A'}</Text>
        </View>
        {prediction.totalPredicted && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Predicted:</Text>
            <Text style={styles.infoValue}>{prediction.totalPredicted.toLocaleString()} units</Text>
          </View>
        )}
        {prediction.avgDailyConsumption && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Avg Daily:</Text>
            <Text style={styles.infoValue}>{prediction.avgDailyConsumption.toFixed(1)} units/day</Text>
          </View>
        )}
        {prediction.maxConsumption && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Max Consumption:</Text>
            <Text style={styles.infoValue}>{prediction.maxConsumption} units</Text>
          </View>
        )}
        {prediction.minConsumption !== undefined && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Min Consumption:</Text>
            <Text style={styles.infoValue}>{prediction.minConsumption} units</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prediction Metrics</Text>
        {prediction.startDate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Forecast Start:</Text>
            <Text style={styles.infoValue}>{prediction.startDate}</Text>
          </View>
        )}
        {prediction.endDate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Forecast End:</Text>
            <Text style={styles.infoValue}>{prediction.endDate}</Text>
          </View>
        )}
        {prediction.daysForecasted && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Days Forecasted:</Text>
            <Text style={styles.infoValue}>{prediction.daysForecasted} days</Text>
          </View>
        )}
        {prediction.trend && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trend:</Text>
            <Text style={[
              styles.infoValue, 
              { color: prediction.trendPercentage > 0 ? '#4CAF50' : '#F44336' }
            ]}>
              {prediction.trend} ({prediction.trendPercentage > 0 ? '+' : ''}{prediction.trendPercentage}%)
            </Text>
          </View>
        )}
        {prediction.variability !== undefined && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Variability:</Text>
            <Text style={styles.infoValue}>{prediction.variability.toFixed(1)}%</Text>
          </View>
        )}
        {prediction.confidence && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Model Confidence:</Text>
            <Text style={styles.infoValue}>{prediction.confidence}%</Text>
          </View>
        )}
      </View>

      {demandPrediction && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demand Prediction</Text>
          <View style={styles.demandCard}>
            <View style={styles.demandHeader}>
              <Text style={styles.demandValue}>{demandPrediction.predictedDemand}</Text>
              <Text style={styles.demandLabel}>Unidades Predichas</Text>
            </View>
            <View style={styles.demandRange}>
              <Text style={styles.demandRangeText}>
                Rango: {demandPrediction.lowerBound} - {demandPrediction.upperBound} unidades
              </Text>
            </View>
            <View style={styles.confidenceBar}>
              <View style={[styles.confidenceFill, { width: `${demandPrediction.confidence}%` }]} />
            </View>
            <Text style={styles.confidenceText}>Confianza: {demandPrediction.confidence}%</Text>
          </View>
          
          <Text style={styles.subSectionTitle}>Factores de Predicción:</Text>
          {demandPrediction.factors && Object.entries(demandPrediction.factors).map(([key, value]) => (
            <View key={key} style={styles.factorRow}>
              <Text style={styles.factorLabel}>{key}:</Text>
              <Text style={styles.factorValue}>{typeof value === 'number' ? value.toFixed(2) : value}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Consumption History Table */}
      {loading ? (
        <View style={styles.section}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading detailed data...</Text>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consumption Forecast</Text>
          {(detailedData?.history || prediction.history) && (
            <HistoryTable history={detailedData?.history || prediction.history} />
          )}
          {(!detailedData?.history && !prediction.history) && (
            <Text style={styles.noDataText}>No historical data available</Text>
          )}
        </View>
      )}

      {/* Summary Statistics */}
      {detailedData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{detailedData.total_predicted?.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Predicted</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{detailedData.avg_daily?.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Avg Daily</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Recommendations</Text>
        {prediction.recommendations ? (
          prediction.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No recommendations available</Text>
        )}
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  scoreContainer: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  recommendationItem: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  demandCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  demandHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  demandValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  demandLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  demandRange: {
    marginBottom: 12,
  },
  demandRangeText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  confidenceText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  subSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 12,
  },
  factorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 4,
    borderRadius: 6,
  },
  factorLabel: {
    fontSize: 13,
    color: '#666',
    textTransform: 'capitalize',
  },
  factorValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 12,
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
