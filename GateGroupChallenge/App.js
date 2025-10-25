// App.js
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { paperTheme } from './challenge1/shared/theme/colors';
import { Module1Navigator } from './challenge1/module1';
import { StorageService } from './challenge1/module1/services/storageService';

export default function App() {
    useEffect(() => {
        // Initialize app (seed test data if needed)
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            // Optional: Seed test data for development
            // Uncomment the line below to add sample products
            // await StorageService.seedTestData();
            console.log('App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    };

    return (
        <SafeAreaProvider>
            <PaperProvider theme={paperTheme}>
                <NavigationContainer>
                    <StatusBar style="auto" />
                    <Module1Navigator />
                </NavigationContainer>
            </PaperProvider>
        </SafeAreaProvider>
    );
}