import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const AlertBanner = ({ alert }) => {
  const getAlertStyle = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          backgroundColor: '#FFEBEE',
          borderColor: '#F44336',
          icon: '!',
          color: '#C62828',
        };
      case 'warning':
        return {
          backgroundColor: '#FFF3E0',
          borderColor: '#FF9800',
          icon: '!',
          color: '#E65100',
        };
      case 'info':
        return {
          backgroundColor: '#E3F2FD',
          borderColor: '#2196F3',
          icon: 'i',
          color: '#1565C0',
        };
      default:
        return {
          backgroundColor: '#F5F5F5',
          borderColor: '#9E9E9E',
          icon: '•',
          color: '#424242',
        };
    }
  };

  const alertStyle = getAlertStyle(alert.severity);

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: alertStyle.backgroundColor,
          borderLeftColor: alertStyle.borderColor,
        }
      ]}
    >
      <Text style={styles.icon}>{alertStyle.icon}</Text>
      <View style={styles.content}>
        <Text style={[styles.title, { color: alertStyle.color }]}>
          {alert.title}
        </Text>
        <Text style={[styles.message, { color: alertStyle.color }]}>
          {alert.message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 8,
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    fontWeight: '900',
    marginRight: 12,
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
  },
});
