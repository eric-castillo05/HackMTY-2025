import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FreshnessChart } from '../components/FreshnessChart';

export const PredictionDetailsScreen = ({ route }) => {
  const { prediction } = route.params;

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
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prediction</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Days remaining:</Text>
          <Text style={styles.infoValue}>{prediction.daysRemaining || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Expiry date:</Text>
          <Text style={styles.infoValue}>{prediction.expiryDate || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Confidence:</Text>
          <Text style={styles.infoValue}>{prediction.confidence || 'N/A'}%</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Freshness History</Text>
        <FreshnessChart data={prediction.history || []} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
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
});
