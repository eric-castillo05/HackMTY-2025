import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FreshnessChart } from '../components/FreshnessChart';

export const PredictionDetailsScreen = ({ route }) => {
  const { prediction, demandPrediction } = route.params;

  const getFreshnessColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 50) return '#FF9800';
    return '#F44336';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.productName}>{prediction.productName}</Text>
        <View 
          style={[
            styles.scoreContainer, 
            { backgroundColor: getFreshnessColor(prediction.freshnessScore) }
          ]}
        >
          <Text style={styles.scoreText}>{prediction.freshnessScore}%</Text>
          <Text style={styles.scoreLabel}>Freshness</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meal Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Batch Number:</Text>
          <Text style={styles.infoValue}>{prediction.batchNumber || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>SKU:</Text>
          <Text style={styles.infoValue}>{prediction.sku || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Type:</Text>
          <Text style={styles.infoValue}>{prediction.category || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Weight:</Text>
          <Text style={styles.infoValue}>{prediction.weight ? `${prediction.weight}g` : 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Quantity:</Text>
          <Text style={styles.infoValue}>{prediction.quantity || 'N/A'} units</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Storage Location:</Text>
          <Text style={styles.infoValue}>{prediction.location || 'N/A'}</Text>
        </View>
        {prediction.flightNumber && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Flight:</Text>
            <Text style={styles.infoValue}>{prediction.flightNumber}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quality Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Production Date:</Text>
          <Text style={styles.infoValue}>
            {prediction.productionDate ? new Date(prediction.productionDate).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Best before:</Text>
          <Text style={styles.infoValue}>
            {prediction.expirationDate ? new Date(prediction.expirationDate).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Days remaining:</Text>
          <Text style={styles.infoValue}>{prediction.daysRemaining !== null ? prediction.daysRemaining : 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Temperature:</Text>
          <Text style={styles.infoValue}>{prediction.temperature ? `${prediction.temperature}°C` : 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Risk Level:</Text>
          <Text style={[styles.infoValue, {color: getFreshnessColor(prediction.freshnessScore)}]}>
            {(prediction.riskLevel || 'unknown').toUpperCase()}
          </Text>
        </View>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Freshness History</Text>
        <FreshnessChart data={prediction.history || []} />
      </View>

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
});
