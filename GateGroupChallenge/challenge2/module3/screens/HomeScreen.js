// challenge2/module3/screens/HomeScreen.js
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../shared/theme/colors';
import { ProductService } from '../services/productService';
import { StatCard } from '../components/StatCard';

export const HomeScreen = ({ navigation }) => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        freshProducts: 0,
        useSoonProducts: 0,
        criticalProducts: 0,
        expiredProducts: 0,
        freshnessPercentage: 100,
    });
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load stats on screen focus
    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [])
    );

    const loadStats = async () => {
        try {
            const dashboardStats = await ProductService.getDashboardStats();
            setStats(dashboardStats);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStats();
        setRefreshing(false);
    };

    const getFreshnessColor = () => {
        if (stats.freshnessPercentage >= 80) return colors.fresh;
        if (stats.freshnessPercentage >= 60) return colors.useSoon;
        return colors.critical;
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Buenos días</Text>
                    <Text style={styles.subtitle}>Base: Monterrey (MTY)</Text>
                </View>
            </View>

            {/* Main Stats Grid */}
            <View style={styles.statsGrid}>
                {/* Total Products Card */}
                <TouchableOpacity 
                    style={[styles.statCard, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('Inventory')}
                >
                    <Text style={styles.statLabel}>Total Productos</Text>
                    <Text style={styles.statValue}>{stats.totalProducts}</Text>
                </TouchableOpacity>

                {/* Products Expiring Soon Card */}
                <TouchableOpacity 
                    style={[styles.statCard, { backgroundColor: colors.warning, marginBottom: spacing.md }]}
                    onPress={() => navigation.navigate('Inventory', { filter: 'critical' })}
                >
                    <Text style={styles.statLabel}>Por Vencer</Text>
                    <Text style={styles.statValue}>{stats.criticalProducts + stats.useSoonProducts}</Text>
                    <Text style={styles.statSubtitle}>Requieren atención</Text>
                </TouchableOpacity>

                {/* Freshness Indicator */}
                <View style={styles.freshnessCard}>
                    <View style={styles.freshnessHeader}>
                        <Text style={styles.freshnessTitle}>Estado General de Frescura</Text>
                        <Text style={[styles.freshnessPercentage, { color: getFreshnessColor() }]}>
                            {stats.freshnessPercentage}%
                        </Text>
                    </View>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${stats.freshnessPercentage}%`,
                                    backgroundColor: getFreshnessColor(),
                                },
                            ]}
                        />
                    </View>
                    <View style={styles.freshnessBreakdown}>
                        <View style={styles.freshnessItem}>
                            <Text style={styles.freshnessLabel}>Frescos</Text>
                            <Text style={[styles.freshnessCount, { color: colors.fresh }]}>{stats.freshProducts}</Text>
                        </View>
                        <View style={styles.freshnessItem}>
                            <Text style={styles.freshnessLabel}>Usar{'\n'}Pronto</Text>
                            <Text style={[styles.freshnessCount, { color: colors.useSoon }]}>{stats.useSoonProducts}</Text>
                        </View>
                        <View style={styles.freshnessItem}>
                            <Text style={styles.freshnessLabel}>Críticos</Text>
                            <Text style={[styles.freshnessCount, { color: colors.critical }]}>{stats.criticalProducts}</Text>
                        </View>
                        <View style={styles.freshnessItem}>
                            <Text style={styles.freshnessLabel}>Vencidos</Text>
                            <Text style={[styles.freshnessCount, { color: colors.error }]}>{stats.expiredProducts}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.lg,
    },
    header: {
        marginBottom: spacing.lg,
    },
    greeting: {
        fontSize: fontSize.xxl,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    statsGrid: {
        marginBottom: spacing.lg,
    },
    statCard: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.md,
    },
    statLabel: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.surface,
        marginBottom: spacing.xs,
        opacity: 0.9,
    },
    statValue: {
        fontSize: fontSize.xxxl,
        fontWeight: '700',
        color: colors.surface,
        marginBottom: spacing.xs,
    },
    statSubtitle: {
        fontSize: fontSize.sm,
        color: colors.surface,
        opacity: 0.8,
    },
    freshnessCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...shadows.md,
    },
    freshnessHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    freshnessTitle: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
    },
    freshnessPercentage: {
        fontSize: fontSize.xxxl,
        fontWeight: '700',
    },
    progressBar: {
        height: 8,
        backgroundColor: colors.border,
        borderRadius: borderRadius.full,
        overflow: 'hidden',
        marginBottom: spacing.lg,
    },
    progressFill: {
        height: '100%',
        borderRadius: borderRadius.full,
    },
    freshnessBreakdown: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    freshnessItem: {
        alignItems: 'center',
        flex: 1,
        paddingHorizontal: 4,
        minWidth: 0,
    },
    freshnessLabel: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        textTransform: 'uppercase',
        fontWeight: '600',
        letterSpacing: 0,
        textAlign: 'center',
        flexWrap: 'wrap',
    },
    freshnessCount: {
        fontSize: fontSize.xxl,
        fontWeight: '700',
        textAlign: 'center',
    },
});