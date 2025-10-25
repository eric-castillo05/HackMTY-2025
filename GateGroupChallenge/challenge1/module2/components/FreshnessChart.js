import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

// TODO: Instalar librería de gráficas como react-native-chart-kit o victory-native
// npm install react-native-chart-kit react-native-svg

export const FreshnessChart = ({ data }) => {
  // Placeholder: aquí irá la implementación de la gráfica
  // Puedes usar react-native-chart-kit, victory-native, o react-native-svg
  
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>CHART</Text>
        <Text style={styles.placeholderLabel}>Trends Chart</Text>
        <Text style={styles.placeholderSubtext}>
          Install: react-native-chart-kit
        </Text>
      </View>
      
      {/* Ejemplo de implementación con react-native-chart-kit:
      
      <LineChart
        data={{
          labels: data.map(d => d.date),
          datasets: [{
            data: data.map(d => d.freshnessScore)
          }]
        }}
        width={Dimensions.get('window').width - 32}
        height={220}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#4CAF50'
          }
        }}
        bezier
        style={styles.chart}
      />
      */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  placeholder: {
    height: 200,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 2,
    marginBottom: 8,
  },
  placeholderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 12,
    color: '#999',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
