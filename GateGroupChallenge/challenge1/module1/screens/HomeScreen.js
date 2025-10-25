// challenge1/module1/screens/HomeScreen.js
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
                    <Text style={styles.greeting}>👋 Buenos días</Text>
                    <Text style={styles.subtitle}>Base: Monterrey (MTY)</Text>
                </View>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Text style={styles.profileIcon}>👤</Text>
                </TouchableOpacity>
            </View>

            {/* Main Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statRow}>
                    <View style={styles.statHalf}>
                        <StatCard
                            title="Total Productos"
                            value={stats.totalProducts}
                            icon="📦"
                            color={colors.primary}
                            onPress={() => navigation.navigate('Inventory')}
                        />
                    </View>
                    <View style={styles.statHalf}>
                        <StatCard
                            title="Por Vencer"
                            value={stats.criticalProducts + stats.useSoonProducts}
                            icon="⚠️"
                            color={colors.warning}
                            subtitle="Requieren atención"
                            onPress={() => navigation.navigate('Inventory', { filter: 'critical' })}
                        />
                    </View>
                </View>

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
                            <Text style={styles.freshnessEmoji}>🟢</Text>
                            <Text style={styles.freshnessCount}>{stats.freshProducts}</Text>
                            <Text style={styles.freshnessLabel}>Frescos</Text>
                        </View>
                        <View style={styles.freshnessItem}>
                            <Text style={styles.freshnessEmoji}>🟡</Text>
                            <Text style={styles.freshnessCount}>{stats.useSoonProducts}</Text>
                            <Text style={styles.freshnessLabel}>Usar Pronto</Text>
                        </View>
                        <View style={styles.freshnessItem}>
                            <Text style={styles.freshnessEmoji}>🔴</Text>
                            <Text style={styles.freshnessCount}>{stats.criticalProducts}</Text>
                            <Text style={styles.freshnessLabel}>Críticos</Text>
                        </View>
                        <View style={styles.freshnessItem}>
                            <Text style={styles.freshnessEmoji}>⚫</Text>
                            <Text style={styles.freshnessCount}>{stats.expiredProducts}</Text>
                            <Text style={styles.freshnessLabel}>Vencidos</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('Scanner')}
                >
                    <View style={styles.actionIcon}>
                        <Text style={styles.actionEmoji}>📷</Text>
                    </View>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Escanear Producto</Text>
                        <Text style={styles.actionSubtitle}>Verifica estado con QR</Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('RegisterLot')}
                >
                    <View style={styles.actionIcon}>
                        <Text style={styles.actionEmoji}>➕</Text>
                    </View>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Registrar Lote</Text>
                        <Text style={styles.actionSubtitle}>Agregar nuevo producto</Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('Inventory')}
                >
                    <View style={styles.actionIcon}>
                        <Text style={styles.actionEmoji}>📋</Text>
                    </View>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Ver Inventario</Text>
                        <Text style={styles.actionSubtitle}>Lista completa de productos</Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    profileButton: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.sm,
    },
    profileIcon: {
        fontSize: fontSize.xl,
    },
    statsGrid: {
        marginBottom: spacing.lg,
    },
    statRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    statHalf: {
        flex: 1,
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
    },
    freshnessItem: {
        alignItems: 'center',
    },
    freshnessEmoji: {
        fontSize: fontSize.xl,
        marginBottom: spacing.xs,
    },
    freshnessCount: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.text,
    },
    freshnessLabel: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        marginTop: 2,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.md,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        backgroundColor: `${colors.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    actionEmoji: {
        fontSize: fontSize.xl,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    actionSubtitle: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    actionArrow: {
        fontSize: fontSize.xxxl,
        color: colors.textLight,
        fontWeight: '300',
    },
});