// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { paperTheme } from './challenge1/shared/theme/colors';
import { DrawerNavigator } from './challenge1/shared/navigation/DrawerNavigator';

export default function App() {
    return (
        <SafeAreaProvider>
            <PaperProvider theme={paperTheme}>
                <NavigationContainer>
                    <StatusBar style="light" />
                    <DrawerNavigator />
                </NavigationContainer>
            </PaperProvider>
        </SafeAreaProvider>
    );
}
