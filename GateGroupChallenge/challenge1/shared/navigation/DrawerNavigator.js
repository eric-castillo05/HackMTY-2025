import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Module1Navigator } from '../../module1';
import { Module2Navigator } from '../../module2';
import { Module3Navigator } from '../../../challenge2/module3';
import { CustomDrawerContent } from './CustomDrawerContent';
import { colors } from '../theme/colors';

const Drawer = createDrawerNavigator();

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      useLegacyImplementation={false}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerType: 'front',
        drawerStyle: {
          width: 300,
          backgroundColor: colors.surface,
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
        swipeEdgeWidth: 50,
      }}
    >
      <Drawer.Screen
        name="Module1"
        component={Module1Navigator}
        options={{
          headerShown: false,
          title: 'Module 1',
        }}
      />
      <Drawer.Screen
        name="Module2"
        component={Module2Navigator}
        options={{
          headerShown: false,
          title: 'Module 2',
        }}
      />
      <Drawer.Screen
        name="Module3"
        component={Module3Navigator}
        options={{
          headerShown: false,
          title: 'Module 3',
        }}
      />
    </Drawer.Navigator>
  );
};
