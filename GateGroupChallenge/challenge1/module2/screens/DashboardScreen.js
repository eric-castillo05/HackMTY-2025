import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { FreshnessChart } from '../components/FreshnessChart';
import { PredictionCard } from '../components/PredictionCard';
import { AlertBanner } from '../components/AlertBanner';
import { ProductService } from '../../shared/services/productService';
import { DemandPredictionService } from '../services/demandPredictionService';

export const DashboardScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groupBy, setGroupBy] = useState('expiration'); // 'expiration', 'category', 'location', 'flight'
  const [statistics, setStatistics] = useState({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get all products from inventory
      const allProducts = await ProductService.getAllProducts();
      const productData = allProducts.map(p => p.toJSON());
      setProducts(productData);
      
      // Get statistics
      const stats = await ProductService.getStatistics();
      setStatistics(stats);
      
      // Generate alerts based on product status
      const newAlerts = [];
      
      const expired = productData.filter(p => p.riskLevel === 'critical');
      if (expired.length > 0) {
        newAlerts.push({
          severity: 'critical',
          title: 'Productos Expirados',
          message: `${expired.length} producto(s) crítico(s) requieren atención inmediata`,
        });
      }
      
      const expiringSoon = productData.filter(p => p.riskLevel === 'high' || p.riskLevel === 'medium');
      if (expiringSoon.length > 0) {
        newAlerts.push({
          severity: 'warning',
          title: 'Atención Requerida',
          message: `${expiringSoon.length} producto(s) próximos a vencer`,
        });
      }
      
      setAlerts(newAlerts);
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

  const handlePredictionPress = (product) => {
    // Generate demand prediction for this product
    const prediction = DemandPredictionService.predictDemand({
      productId: product.id,
      productCategory: product.category,
      flightDate: product.flightDate || new Date().toISOString(),
      flightClass: 'economy',
      menuRotation: null,
      historicalData: [],
      passengerCount: 180,
      flightDuration: 3,
    });
    
    navigation.navigate('PredictionDetails', { 
      prediction: product,
      demandPrediction: prediction,
    });
  };
  
  const getGroupedProducts = () => {
    if (groupBy === 'expiration') {
      const grouped = {
        critical: products.filter(p => p.riskLevel === 'critical'),
        high: products.filter(p => p.riskLevel === 'high'),
        medium: products.filter(p => p.riskLevel === 'medium'),
        low: products.filter(p => p.riskLevel === 'low'),
      };
      return Object.entries(grouped).filter(([_, items]) => items.length > 0);
    } else if (groupBy === 'category') {
      const grouped = {};
      products.forEach(p => {
        const cat = p.category || 'Sin categoría';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(p);
      });
      return Object.entries(grouped);
    } else if (groupBy === 'location') {
      const grouped = {};
      products.forEach(p => {
        const loc = p.location || 'Sin ubicación';
        if (!grouped[loc]) grouped[loc] = [];
        grouped[loc].push(p);
      });
      return Object.entries(grouped);
    } else if (groupBy === 'flight') {
      const grouped = {};
      products.forEach(p => {
        const flight = p.flightNumber || 'Sin vuelo asignado';
        if (!grouped[flight]) grouped[flight] = [];
        grouped[flight].push(p);
      });
      return Object.entries(grouped);
    }
    return [['all', products]];
  };

  const groupedProducts = getGroupedProducts();

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
        
        {/* Statistics */}
        {statistics.totalProducts > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{statistics.totalProducts}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: '#F44336'}]}>{statistics.expired}</Text>
              <Text style={styles.statLabel}>Expirados</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: '#FF9800'}]}>{statistics.expiringSoon}</Text>
              <Text style={styles.statLabel}>Por Vencer</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: '#4CAF50'}]}>{statistics.fresh}</Text>
              <Text style={styles.statLabel}>Frescos</Text>
            </View>
          </View>
        )}
      </View>

      {alerts.length > 0 && (
        <View style={styles.alertsSection}>
          {alerts.map((alert, index) => (
            <AlertBanner key={index} alert={alert} />
          ))}
        </View>
      )}

      {/* Grouping controls */}
      <View style={styles.groupingSection}>
        <Text style={styles.groupingTitle}>Agrupar por:</Text>
        <View style={styles.groupingButtons}>
          <TouchableOpacity 
            style={[styles.groupBtn, groupBy === 'expiration' && styles.groupBtnActive]}
            onPress={() => setGroupBy('expiration')}
          >
            <Text style={[styles.groupBtnText, groupBy === 'expiration' && styles.groupBtnTextActive]}>Expiración</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.groupBtn, groupBy === 'category' && styles.groupBtnActive]}
            onPress={() => setGroupBy('category')}
          >
            <Text style={[styles.groupBtnText, groupBy === 'category' && styles.groupBtnTextActive]}>Categoría</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.groupBtn, groupBy === 'location' && styles.groupBtnActive]}
            onPress={() => setGroupBy('location')}
          >
            <Text style={[styles.groupBtnText, groupBy === 'location' && styles.groupBtnTextActive]}>Ubicación</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.groupBtn, groupBy === 'flight' && styles.groupBtnActive]}
            onPress={() => setGroupBy('flight')}
          >
            <Text style={[styles.groupBtnText, groupBy === 'flight' && styles.groupBtnTextActive]}>Vuelo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Products list */}
      <View style={styles.predictionsSection}>
        {loading ? (
          <Text style={styles.loadingText}>Cargando...</Text>
        ) : products.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay productos escaneados</Text>
            <Text style={styles.emptyHint}>Escanea un código QR para comenzar</Text>
          </View>
        ) : (
          groupedProducts.map(([groupName, groupProducts]) => (
            <View key={groupName} style={styles.productGroup}>
              <Text style={styles.groupTitle}>{groupName.toUpperCase()} ({groupProducts.length})</Text>
              {groupProducts.map((product) => (
                <PredictionCard
                  key={product.id}
                  prediction={product}
                  onPress={() => handlePredictionPress(product)}
                />
              ))}
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
  alertsSection: {
    padding: 16,
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
    paddingVertical: 8,
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
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  groupBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  predictionsSection: {
    padding: 16,
  },
  productGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    letterSpacing: 0.5,
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
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyHint: {
    textAlign: 'center',
    color: '#bbb',
    fontSize: 14,
    marginTop: 8,
  },
});
