// challenge2/shared/navigation/CustomDrawerContent.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { colors } from '../theme/colors';

export const CustomDrawerContent = (props) => {
    return (
        <DrawerContentScrollView {...props}>
            <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>Challenge 2</Text>
            </View>
            <DrawerItem
                label="Module 3"
                onPress={() => props.navigation.navigate('Module3')}
                labelStyle={styles.drawerLabel}
            />
        </DrawerContentScrollView>
    );
};

const styles = StyleSheet.create({
    drawerHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray,
    },
    drawerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    drawerLabel: {
        color: colors.text,
    },
});