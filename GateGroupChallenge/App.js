// App.js
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { paperTheme } from './challenge1/shared/theme/colors';
import { Module1Navigator } from './challenge1/module1';

export default function App() {
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