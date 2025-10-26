import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ForecastVisualizationScreen } from '../screens/ForecastVisualizationScreen';

const Stack = createStackNavigator();

export const Module2Navigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="ForecastVisualization"
        component={ForecastVisualizationScreen}
        options={{
          title: 'Consumption Forecast',
        }}
      />
    </Stack.Navigator>
  );
};
