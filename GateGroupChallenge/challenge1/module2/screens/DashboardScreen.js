import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';

// Network configuration:
// - iOS Simulator: use 'http://localhost:5002'
// - Android Emulator: use 'http://10.0.2.2:5002'
// - Physical device with tunnel: use ngrok or Expo tunnel
// - Physical device on same network: use your machine's local IP
// Current setup: Change this to match your environment
// TODO: Replace with your ngrok URL (e.g., 'https://abc123.ngrok.io')
const API_BASE_URL = 'https://{{your-ngrok-url}}.ngrok.io';

export const DashboardScreen = ({ navigation }) => {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [groupBy, setGroupBy] = useState('flight'); // 'flight', 'product', 'date'
  const [horizon, setHorizon] = useState('14');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadForecasts();
  }, []);

  const loadForecasts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filePath = '/Users/diegogax10/Documents/Workspace/HackMTY-2025/predict.xlsx';
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch(
          `${API_BASE_URL}/forecast_predict_group?path_file=${encodeURIComponent(filePath)}&horizon=${horizon}`,
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
        setForecasts(data.data || []);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Timeout: El servidor no respondió a tiempo. Verifica que el servidor esté corriendo y sea accesible desde ' + API_BASE_URL);
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Error loading forecasts:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadForecasts();
    setRefreshing(false);
  };

  const getGroupedForecasts = () => {
    let filtered = forecasts;
    
    if (searchTerm) {
      filtered = forecasts.filter(f => 
        f.Flight_ID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.Product_ID?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (groupBy === 'flight') {
      const grouped = {};
      filtered.forEach(f => {
        const key = f.Flight_ID;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(f);
      });
      return Object.entries(grouped).map(([key, items]) => ({
        title: `Vuelo ${key}`,
        data: items,
        key,
      }));
    } else if (groupBy === 'product') {
      const grouped = {};
      filtered.forEach(f => {
        const key = f.Product_ID;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(f);
      });
      return Object.entries(grouped).map(([key, items]) => ({
        title: `Producto ${key}`,
        data: items,
        key,
      }));
    } else {
      const grouped = {};
      filtered.forEach(f => {
        const date = f.Date?.split('T')[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(f);
      });
      return Object.entries(grouped).map(([key, items]) => ({
        title: key,
        data: items,
        key,
      }));
    }
  };

  const getStatistics = () => {
    if (forecasts.length === 0) return null;
    
    const totalPredicted = forecasts.reduce((sum, f) => sum + (f.Quantity_Consumed_pred || 0), 0);
    const avgPredicted = totalPredicted / forecasts.length;
    const uniqueFlights = new Set(forecasts.map(f => f.Flight_ID)).size;
    const uniqueProducts = new Set(forecasts.map(f => f.Product_ID)).size;
    const uniqueDates = new Set(forecasts.map(f => f.Date?.split('T')[0])).size;

    return {
      total: forecasts.length,
      totalPredicted: Math.round(totalPredicted),
      avgPredicted: Math.round(avgPredicted),
      uniqueFlights,
      uniqueProducts,
      uniqueDates,
    };
  };

  const groupedForecasts = getGroupedForecasts();
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
              <Text style={styles.statLabel}>Predicciones</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: '#2196F3'}]}>{stats.uniqueFlights}</Text>
              <Text style={styles.statLabel}>Vuelos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: '#4CAF50'}]}>{stats.uniqueProducts}</Text>
              <Text style={styles.statLabel}>Productos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: '#FF9800'}]}>{stats.totalPredicted}</Text>
              <Text style={styles.statLabel}>Total Pred.</Text>
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

      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Text style={styles.errorHint}>Servidor Flask debe estar en puerto 5002</Text>
          <Text style={styles.errorHint}>• iOS Simulator: usa localhost:5002</Text>
          <Text style={styles.errorHint}>• Expo tunnel: usa ngrok o cambia a --lan mode</Text>
          <Text style={styles.errorHint}>• Physical device: usa IP local (10.22.65.20:5002)</Text>
        </View>
      )}

      {/* Grouping Options */}
      <View style={styles.groupingSection}>
        <Text style={styles.groupingTitle}>Agrupar por:</Text>
        <View style={styles.groupingButtons}>
          <TouchableOpacity 
            style={[styles.groupBtn, groupBy === 'flight' && styles.groupBtnActive]}
            onPress={() => setGroupBy('flight')}
          >
            <Text style={[styles.groupBtnText, groupBy === 'flight' && styles.groupBtnTextActive]}>✈️ Vuelo</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.groupBtn, groupBy === 'product' && styles.groupBtnActive]}
            onPress={() => setGroupBy('product')}
          >
            <Text style={[styles.groupBtnText, groupBy === 'product' && styles.groupBtnTextActive]}>📦 Producto</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.groupBtn, groupBy === 'date' && styles.groupBtnActive]}
            onPress={() => setGroupBy('date')}
          >
            <Text style={[styles.groupBtnText, groupBy === 'date' && styles.groupBtnTextActive]}>📅 Fecha</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Forecasts */}
      <View style={styles.forecastsSection}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Cargando predicciones...</Text>
          </View>
        ) : forecasts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>📊 No hay predicciones disponibles</Text>
            <Text style={styles.emptyHint}>Presiona para recargar</Text>
            <TouchableOpacity style={styles.reloadBtn} onPress={loadForecasts}>
              <Text style={styles.reloadBtnText}>🔄 Recargar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          groupedForecasts.map((group) => (
            <View key={group.key} style={styles.forecastGroup}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                <Text style={styles.groupCount}>{group.data.length} items</Text>
              </View>
              {group.data.slice(0, 5).map((forecast, idx) => (
                <View key={idx} style={styles.forecastCard}>
                  <View style={styles.forecastRow}>
                    <View style={styles.forecastInfo}>
                      <Text style={styles.forecastFlight}>✈️ {forecast.Flight_ID}</Text>
                      <Text style={styles.forecastProduct}>📦 {forecast.Product_ID}</Text>
                      <Text style={styles.forecastDate}>📅 {forecast.Date?.split('T')[0]}</Text>
                    </View>
                    <View style={styles.forecastPrediction}>
                      <Text style={styles.predictionValue}>{forecast.Quantity_Consumed_pred}</Text>
                      <Text style={styles.predictionLabel}>Consumo pred.</Text>
                    </View>
                  </View>
                  <View style={styles.forecastDetails}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Especificación</Text>
                      <Text style={styles.detailValue}>{forecast.Standard_Specification_Qty}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Retornado</Text>
                      <Text style={styles.detailValue}>{forecast.Quantity_Returned}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Día semana</Text>
                      <Text style={styles.detailValue}>{['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][forecast.dow]}</Text>
                    </View>
                  </View>
                </View>
              ))}
              {group.data.length > 5 && (
                <Text style={styles.moreItems}>+ {group.data.length - 5} más...</Text>
              )}
            </View>
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
  groupingSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  groupingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  groupingButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  groupBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  groupBtnActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  groupBtnText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  groupBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
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
  forecastGroup: {
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
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  groupCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  forecastCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  forecastInfo: {
    flex: 1,
  },
  forecastFlight: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  forecastProduct: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  forecastDate: {
    fontSize: 13,
    color: '#999',
  },
  forecastPrediction: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  predictionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  predictionLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  forecastDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  moreItems: {
    textAlign: 'center',
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
});
