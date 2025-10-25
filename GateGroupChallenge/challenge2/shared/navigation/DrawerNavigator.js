// challenge2/shared/navigation/DrawerNavigator.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Module3Navigator } from '../../module3';
import { CustomDrawerContent } from './CustomDrawerContent';
import { colors } from '../theme/colors';

const Drawer = createDrawerNavigator();

export const DrawerNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    backgroundColor: colors.background,
                },
            }}
        >
            <Drawer.Screen
                name="Module3"
                component={Module3Navigator}
                options={{ title: 'Module 3' }}
            />
        </Drawer.Navigator>
    );
};