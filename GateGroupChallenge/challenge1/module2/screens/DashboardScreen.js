import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';

// Network configuration:
// - iOS Simulator: use 'http://localhost:5001'
// - Android Emulator: use 'http://10.0.2.2:5001'
// - Ubuntu server: use 'http://YOUR_SERVER_IP:5001'
// Current setup: Replace with your Ubuntu server IP
const API_BASE_URL = 'http://{{YOUR_SERVER_IP}}:5001';

export const DashboardScreen = ({ navigation }) => {
  const [predictions, setPredictions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/predictions`,
          {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
            },
          }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.status}`);
        }
        
        const data = await response.json();
        setPredictions(data.predictions || []);
        setAlerts(data.alerts || []);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Timeout: El servidor no respondió a tiempo. Verifica que el servidor esté corriendo en puerto 5001 y sea accesible desde ' + API_BASE_URL);
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Error loading predictions:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPredictions();
    setRefreshing(false);
  };

  const getFilteredPredictions = () => {
    if (!searchTerm) return predictions;
    
    return predictions.filter(p => 
      p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getStatistics = () => {
    if (predictions.length === 0) return null;
    
    const totalPredicted = predictions.reduce((sum, p) => sum + (p.totalPredicted || 0), 0);
    const avgScore = predictions.reduce((sum, p) => sum + (p.predictabilityScore || 0), 0) / predictions.length;
    const highVariability = predictions.filter(p => p.variability > 30).length;

    return {
      total: predictions.length,
      totalPredicted: Math.round(totalPredicted),
      avgScore: Math.round(avgScore),
      highVariability,
      alertCount: alerts.length,
    };
  };

  const filteredPredictions = getFilteredPredictions();
  const stats = getStatistics();

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Forecast de Consumo</Text>
        <Text style={styles.subtitle}>Predicciones ML basadas en datos históricos</Text>
        
        {/* Statistics */}
        {stats && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Productos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: '#2196F3'}]}>{stats.avgScore}</Text>
              <Text style={styles.statLabel}>Score Prom.</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: '#FF9800'}]}>{stats.totalPredicted}</Text>
              <Text style={styles.statLabel}>Total Pred.</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: stats.alertCount > 0 ? '#FF5722' : '#4CAF50'}]}>{stats.alertCount}</Text>
              <Text style={styles.statLabel}>Alertas</Text>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar vuelo o producto..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </View>

      {/* Alerts Banner */}
      {alerts.length > 0 && !error && (
        <View style={styles.alertsSection}>
          {alerts.slice(0, 3).map((alert, idx) => (
            <View key={idx} style={[styles.alertBanner, 
              alert.severity === 'warning' ? styles.alertWarning : styles.alertInfo
            ]}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertMessage}>{alert.message}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Text style={styles.errorHint}>Servidor Flask debe estar en puerto 5001 (app.py)</Text>
          <Text style={styles.errorHint}>• iOS Simulator: usa localhost:5001</Text>
          <Text style={styles.errorHint}>• Expo tunnel: usa ngrok o cambia a --lan mode</Text>
          <Text style={styles.errorHint}>• Physical device: usa IP local (10.22.65.20:5001)</Text>
        </View>
      )}


      {/* Predictions */}
      <View style={styles.forecastsSection}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Cargando predicciones...</Text>
          </View>
        ) : predictions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>📊 No hay predicciones disponibles</Text>
            <Text style={styles.emptyHint}>Presiona para recargar</Text>
            <TouchableOpacity style={styles.reloadBtn} onPress={loadPredictions}>
              <Text style={styles.reloadBtnText}>🔄 Recargar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredPredictions.map((prediction) => (
            <TouchableOpacity 
              key={prediction.id} 
              style={styles.predictionCard}
              onPress={() => navigation.navigate('PredictionDetails', { prediction })}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.productName}>{prediction.productName}</Text>
                  <Text style={styles.productSku}>SKU: {prediction.sku}</Text>
                </View>
                <View style={styles.scoreContainer}>
                  <Text style={[styles.scoreValue, {
                    color: prediction.predictabilityScore >= 70 ? '#4CAF50' : 
                           prediction.predictabilityScore >= 50 ? '#FF9800' : '#FF5722'
                  }]}>{prediction.predictabilityScore}</Text>
                  <Text style={styles.scoreLabel}>Score</Text>
                </View>
              </View>
              
              <View style={styles.predictionStats}>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxValue}>{prediction.totalPredicted}</Text>
                  <Text style={styles.statBoxLabel}>Total Pred.</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxValue}>{prediction.avgDailyConsumption}</Text>
                  <Text style={styles.statBoxLabel}>Prom. Diario</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statBoxValue, {
                    color: prediction.trend === 'Incrementando' ? '#4CAF50' : '#FF9800'
                  }]}>{prediction.trendPercentage > 0 ? '+' : ''}{prediction.trendPercentage}%</Text>
                  <Text style={styles.statBoxLabel}>{prediction.trend}</Text>
                </View>
              </View>

              <View style={styles.dateRange}>
                <Text style={styles.dateText}>📅 {prediction.startDate} → {prediction.endDate}</Text>
              </View>

              {prediction.recommendations && prediction.recommendations.length > 0 && (
                <View style={styles.recommendations}>
                  <Text style={styles.recommendationText}>💡 {prediction.recommendations[0]}</Text>
                </View>
              )}
            </TouchableOpacity>
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
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    marginTop: 12,
  },
  searchInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  errorBanner: {
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
    fontWeight: '600',
  },
  errorHint: {
    color: '#8B4513',
    fontSize: 13,
    marginTop: 4,
  },
  alertsSection: {
    padding: 16,
    paddingTop: 0,
  },
  alertBanner: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  alertWarning: {
    backgroundColor: '#FFF3CD',
    borderLeftColor: '#FFA726',
  },
  alertInfo: {
    backgroundColor: '#E3F2FD',
    borderLeftColor: '#2196F3',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 13,
    color: '#666',
  },
  forecastsSection: {
    padding: 16,
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
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyHint: {
    textAlign: 'center',
    color: '#bbb',
    fontSize: 14,
    marginBottom: 20,
  },
  reloadBtn: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  reloadBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  predictionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  productSku: {
    fontSize: 13,
    color: '#999',
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  predictionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statBoxValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statBoxLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  dateRange: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  recommendations: {
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  recommendationText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '500',
  },
});
