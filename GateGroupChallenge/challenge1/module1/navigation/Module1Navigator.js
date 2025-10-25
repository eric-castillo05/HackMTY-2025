// challenge1/module1/navigation/Module1Navigator.js
import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, fontSize } from '../../shared/theme/colors';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { RegisterLotScreen } from '../screens/RegisterLotScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { InventoryScreen } from '../screens/InventoryScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator (Home, Inventory, Scanner)
const TabNavigator = () => {
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
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Inicio',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>🏠</Text>
                    ),
                    headerTitle: 'GateGroup Inventory',
                }}
            />
            <Tab.Screen
                name="Scanner"
                component={ScannerScreen}
                options={{
                    title: 'Escanear',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>📷</Text>
                    ),
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="Inventory"
                component={InventoryScreen}
                options={{
                    title: 'Inventario',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>📋</Text>
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

// Main Stack Navigator
export const Module1Navigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.surface,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                    fontWeight: '700',
                },
                headerBackTitle: 'Atrás',
            }}
        >
            <Stack.Screen
                name="Tabs"
                component={TabNavigator}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="RegisterLot"
                component={RegisterLotScreen}
                options={{
                    title: 'Registrar Lote',
                    presentation: 'modal',
                }}
            />
            <Stack.Screen
                name="ProductDetail"
                component={ProductDetailScreen}
                options={{
                    title: 'Detalle del Producto',
                }}
            />
        </Stack.Navigator>
    );
};