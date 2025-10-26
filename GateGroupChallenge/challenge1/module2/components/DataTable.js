import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

/**
 * Componente de tabla reutilizable para mostrar datos tabulares
 * @param {Array} data - Array de objetos con los datos
 * @param {Array} columns - Array de objetos que definen las columnas
 *   Formato: [{ key: 'campo', label: 'Etiqueta', width: 100, render: (value) => formatted }]
 */
export const DataTable = ({ data = [], columns = [], title = '' }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay datos disponibles</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View>
          {/* Header */}
          <View style={styles.headerRow}>
            {columns.map((col, index) => (
              <View
                key={col.key}
                style={[
                  styles.headerCell,
                  { width: col.width || 120 },
                  index === 0 && styles.firstCell,
                  index === columns.length - 1 && styles.lastCell,
                ]}
              >
                <Text style={styles.headerText} numberOfLines={2}>
                  {col.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Rows */}
          <ScrollView style={styles.scrollableBody}>
            {data.map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={[
                  styles.row,
                  rowIndex % 2 === 0 ? styles.evenRow : styles.oddRow,
                ]}
              >
                {columns.map((col, colIndex) => {
                  const value = row[col.key];
                  const displayValue = col.render ? col.render(value, row) : value;

                  return (
                    <View
                      key={col.key}
                      style={[
                        styles.cell,
                        { width: col.width || 120 },
                        colIndex === 0 && styles.firstCell,
                        colIndex === columns.length - 1 && styles.lastCell,
                      ]}
                    >
                      <Text style={styles.cellText} numberOfLines={2}>
                        {displayValue}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

/**
 * Componente de tabla compacta para resumen de métricas
 */
export const MetricsTable = ({ metrics = {} }) => {
  const metricsArray = Object.entries(metrics).map(([key, value]) => ({
    metric: key,
    value: typeof value === 'number' ? value.toFixed(2) : value,
  }));

  const columns = [
    { key: 'metric', label: 'Métrica', width: 150 },
    { key: 'value', label: 'Valor', width: 100 },
  ];

  return <DataTable data={metricsArray} columns={columns} title="Métricas del Modelo" />;
};

/**
 * Componente de tabla para predicciones de Vuelos
 */
export const PredictionsTable = ({ predictions = [] }) => {
  const columns = [
    {
      key: 'sku',
      label: 'SKU',
      width: 100,
    },
    {
      key: 'NVuelo',
      label: 'Vuelo',
      width: 180,
    },
    {
      key: 'predictabilityScore',
      label: 'Score',
      width: 80,
      render: (value) => `${value}%`,
    },
    {
      key: 'totalPredicted',
      label: 'Total Predicho',
      width: 120,
      render: (value) => value?.toLocaleString() || '0',
    },
    {
      key: 'avgDailyConsumption',
      label: 'Promedio Diario',
      width: 130,
      render: (value) => value?.toFixed(1) || '0',
    },
    {
      key: 'trend',
      label: 'Tendencia',
      width: 130,
      render: (value, row) => {
        const pct = row.trendPercentage || 0;
        const color = pct > 0 ? '#4CAF50' : '#F44336';
        return (
          <Text style={{ color }}>
            {value} ({pct > 0 ? '+' : ''}{pct.toFixed(1)}%)
          </Text>
        );
      },
    },
    {
      key: 'variability',
      label: 'Variabilidad',
      width: 110,
      render: (value) => `${value?.toFixed(1) || 0}%`,
    },
    {
      key: 'confidence',
      label: 'Confianza',
      width: 100,
      render: (value) => `${value}%`,
    },
  ];

  return <DataTable data={predictions} columns={columns} title="Predicciones de Consumo" />;
};

/**
 * Componente de tabla para historial de predicciones diarias
 */
export const HistoryTable = ({ history = [] }) => {
  const columns = [
    {
      key: 'date',
      label: 'Fecha',
      width: 110,
    },
    {
      key: 'day_of_week',
      label: 'Día',
      width: 100,
    },
    {
      key: 'predicted_consumption',
      label: 'Consumo Predicho',
      width: 150,
      render: (value) => value?.toLocaleString() || '0',
    },
    {
      key: 'week_number',
      label: 'Semana',
      width: 80,
    },
  ];

  return <DataTable data={history} columns={columns} title="Historial de Predicciones" />;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerCell: {
    padding: 12,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#1976D2',
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  scrollableBody: {
    maxHeight: 400,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  evenRow: {
    backgroundColor: '#F5F5F5',
  },
  oddRow: {
    backgroundColor: '#fff',
  },
  cell: {
    padding: 12,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  cellText: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
  firstCell: {
    borderLeftWidth: 0,
  },
  lastCell: {
    borderRightWidth: 0,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
