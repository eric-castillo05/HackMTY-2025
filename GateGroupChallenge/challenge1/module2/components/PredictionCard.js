import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export const PredictionCard = ({ prediction, onPress }) => {
  const getFreshnessColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 50) return '#FF9800';
    return '#F44336';
  };

  const getStatusText = (score) => {
    if (score >= 80) return 'Fresh';
    if (score >= 50) return 'Medium';
    return 'Critical';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        <View style={styles.leftSection}>
          <Text style={styles.productName}>{prediction.productName}</Text>
          <Text style={styles.category}>{prediction.category || 'No category'}</Text>
          <Text style={styles.location}>{prediction.location || 'No location'}</Text>
        </View>
        
        <View style={styles.rightSection}>
          <View 
            style={[
              styles.scoreCircle, 
              { backgroundColor: getFreshnessColor(prediction.freshnessScore) }
            ]}
          >
            <Text style={styles.scoreText}>{prediction.freshnessScore}%</Text>
          </View>
          <Text style={[styles.statusText, { color: getFreshnessColor(prediction.freshnessScore) }]}>
            {getStatusText(prediction.freshnessScore)}
          </Text>
        </View>
      </View>
      
      {prediction.daysRemaining !== undefined && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {prediction.daysRemaining} days remaining
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: '#999',
  },
  rightSection: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 13,
    color: '#666',
  },
});
