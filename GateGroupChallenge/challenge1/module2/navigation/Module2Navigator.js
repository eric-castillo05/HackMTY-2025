import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { DashboardScreen } from '../screens/DashboardScreen';
import { PredictionDetailsScreen } from '../screens/PredictionDetailsScreen';
import { colors } from '../../shared/theme/colors';

const Stack = createStackNavigator();

const MenuButton = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.openDrawer()}
      style={{ marginLeft: 16 }}
    >
      <Text style={{ fontSize: 24, color: colors.surface, fontWeight: '600' }}>☰</Text>
    </TouchableOpacity>
  );
};

const BackButton = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={{ marginLeft: 16 }}
    >
      <Text style={{ fontSize: 24, color: colors.surface, fontWeight: '600' }}>←</Text>
    </TouchableOpacity>
  );
};

export const Module2Navigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
          elevation: 4,
          shadowOpacity: 0.3,
        },
        headerTintColor: colors.surface,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerLeft: () => <MenuButton />,
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: 'Forecast de Consumo',
        }}
      />
      <Stack.Screen 
        name="PredictionDetails" 
        component={PredictionDetailsScreen}
        options={{
          title: 'Meal Details',
          headerLeft: () => <BackButton />,
        }}
      />
    </Stack.Navigator>
  );
};
