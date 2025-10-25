// challenge1/module1/navigation/Module1Navigator.js
import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, fontSize } from '../../shared/theme/colors';

// Screens
import { ScannerScreen } from '../screens/ScannerScreen';
import { HistoryScreen } from '../screens/HistoryScreen';

const Tab = createBottomTabNavigator();

// Main Tab Navigator - Solo Scanner e Historial
export const Module1Navigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: fontSize.xs,
                    fontWeight: '600',
                },
                headerStyle: {
                    backgroundColor: colors.surface,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                    fontWeight: '700',
                },
            }}
        >
            <Tab.Screen
                name="Scanner"
                component={ScannerScreen}
                options={{
                    title: 'SCANNER',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size - 4, color, fontWeight: 'bold' }}>□</Text>
                    ),
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{
                    title: 'HISTORY',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size - 4, color, fontWeight: 'bold' }}>≡</Text>
                    ),
                    headerTitle: 'SCAN HISTORY',
                }}
            />
        </Tab.Navigator>
    );
};
