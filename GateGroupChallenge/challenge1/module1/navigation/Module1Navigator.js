// challenge1/module1/navigation/Module1Navigator.js
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { colors, fontSize } from '../../shared/theme/colors';

// Screens
import { ScannerScreen } from '../screens/ScannerScreen';
import { HistoryScreen } from '../screens/HistoryScreen';

const Tab = createBottomTabNavigator();

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
            <Tab.Screen
                name="Scanner"
                component={ScannerScreen}
                options={{
                    title: 'Scanner',
                    headerTitle: 'QR Scanner',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size - 4, color, fontWeight: 'bold' }}>□</Text>
                    ),
                }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{
                    title: 'History',
                    headerTitle: 'Scan History',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size - 4, color, fontWeight: 'bold' }}>≡</Text>
                    ),
                }}
            />
        </Tab.Navigator>
    );
};
