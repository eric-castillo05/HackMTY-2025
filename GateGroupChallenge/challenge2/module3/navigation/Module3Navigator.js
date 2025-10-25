// challenge2/module3/navigation/Module3Navigator.js
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, fontSize } from '../../shared/theme/colors';
import { useNavigation } from '@react-navigation/native';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { RegisterLotScreen } from '../screens/RegisterLotScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { InventoryScreen } from '../screens/InventoryScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Menu button placed on headers to open the drawer
const MenuButton = () => {
    const navigation = useNavigation();
    return (
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginLeft: 12 }}>
            <Text style={{ fontSize: 22, color: colors.surface, fontWeight: '700' }}>☰</Text>
        </TouchableOpacity>
    );
};

// Custom Tab Bar Icons
const TabBarIcon = ({ name, color, size }) => {
    const icons = {
        Home: '●',
        Scanner: '◆',
        Inventory: '■',
    };
    
    return (
        <Text style={{ 
            fontSize: size , 
            color,
            fontWeight: '700',
        }}>
            {icons[name] || '●'}
        </Text>
    );
};

// Tab Navigator (Home, Inventory, Scanner)
const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerLeft: () => <MenuButton />,
                headerStyle: {
                    backgroundColor: colors.primary,
                },
                headerTintColor: colors.surface,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    height: 60,
                    
                },
                tabBarLabelStyle: {
                    fontSize: fontSize.xs,
                    fontWeight: '600',
                },
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
                        <TabBarIcon name="Home" color={color} size={size} />
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
                        <TabBarIcon name="Scanner" color={color} size={size} />
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
                        <TabBarIcon name="Inventory" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

// Main Stack Navigator
export const Module3Navigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerLeft: () => <MenuButton />,
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