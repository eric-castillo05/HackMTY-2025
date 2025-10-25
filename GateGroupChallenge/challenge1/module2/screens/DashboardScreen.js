import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { FreshnessChart } from '../components/FreshnessChart';
import { PredictionCard } from '../components/PredictionCard';
import { AlertBanner } from '../components/AlertBanner';
import { PredictionService } from '../services/predictionService';

export const DashboardScreen = ({ navigation }) => {
  const [predictions, setPredictions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await PredictionService.getFreshnessPredictions();
      setPredictions(data.predictions || []);
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handlePredictionPress = (prediction) => {
    navigation.navigate('PredictionDetails', { prediction });
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Airplane Meal Freshness</Text>
        <Text style={styles.subtitle}>Real-time quality monitoring</Text>
      </View>

      {alerts.length > 0 && (
        <View style={styles.alertsSection}>
          {alerts.map((alert, index) => (
            <AlertBanner key={index} alert={alert} />
          ))}
        </View>
      )}

      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Freshness Trends</Text>
        <FreshnessChart data={predictions} />
      </View>

      <View style={styles.predictionsSection}>
        <Text style={styles.sectionTitle}>Monitored Meals</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : predictions.length === 0 ? (
          <Text style={styles.emptyText}>No meal data available</Text>
        ) : (
          predictions.map((prediction) => (
            <PredictionCard
              key={prediction.id}
              prediction={prediction}
              onPress={() => handlePredictionPress(prediction)}
            />
          ))
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
  alertsSection: {
    padding: 16,
  },
  chartSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  predictionsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  },
});
