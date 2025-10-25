// challenge1/module1/screens/HistoryScreen.js
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../shared/theme/colors';
import { QRCounterService } from '../services/qrCounterService';

export const HistoryScreen = () => {
    const [scans, setScans] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadScans();
        }, [])
    );

    const loadScans = async () => {
        try {
            const allScans = await QRCounterService.getAllScans();
            // Sort by most recent
            const sorted = allScans.sort((a, b) => 
                new Date(b.lastScanned) - new Date(a.lastScanned)
            );
            setScans(sorted);
        } catch (error) {
            console.error('Error loading scans:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadScans();
        setRefreshing(false);
    };

    const handleDeleteScan = (qrCode) => {
        Alert.alert(
            'Eliminar Registro',
            '¿Estás seguro de que deseas eliminar este registro de escaneo?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await QRCounterService.deleteScan(qrCode);
                            await loadScans();
                        } catch (error) {
                            console.error('Error deleting scan:', error);
                        }
                    },
                },
            ]
        );
    };

    const handleClearAll = () => {
        Alert.alert(
            'Limpiar Todo',
            '¿Estás seguro de que deseas eliminar todo el historial?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Limpiar Todo',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await QRCounterService.clearAllScans();
                            await loadScans();
                        } catch (error) {
                            console.error('Error clearing scans:', error);
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString('es-MX', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.scanCard}
            onLongPress={() => handleDeleteScan(item.qrCode)}
            activeOpacity={0.7}
        >
            <View style={styles.scanHeader}>
                <View style={[styles.statusDot, { 
                    backgroundColor: item.isValid ? '#00FF00' : '#FF0000' 
                }]} />
                <Text style={styles.qrCode} numberOfLines={1} ellipsizeMode="middle">
                    {item.qrCode}
                </Text>
                {item.count > 1 && (
                    <View style={styles.repeatBadge}>
                        <Text style={styles.repeatText}>DUPLICATE</Text>
                    </View>
                )}
            </View>
            
            {item.isValid && item.firebaseData && (
                <View style={styles.dataPreview}>
                    {Object.entries(item.firebaseData).slice(0, 2).map(([key, value]) => {
                        if (key === 'id' || key === 'code' || key === 'verifiedAt') return null;
                        return (
                            <View key={key} style={styles.previewItem}>
                                <Text style={styles.previewLabel}>{key.toUpperCase()}:</Text>
                                <Text style={styles.previewValue}>{String(value)}</Text>
                            </View>
                        );
                    })}
                </View>
            )}
            
            <View style={styles.scanDetails}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>SCANS:</Text>
                    <Text style={styles.detailValue}>{item.count}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>LAST:</Text>
                    <Text style={styles.detailValue}>{formatDate(item.lastScanned)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const EmptyList = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>□</Text>
            </View>
            <Text style={styles.emptyTitle}>NO SCAN RECORDS</Text>
            <Text style={styles.emptyText}>
                Start scanning QR codes to build history
            </Text>
        </View>
    );

    const totalScans = scans.reduce((sum, scan) => sum + scan.count, 0);
    const uniqueQRs = scans.length;

    return (
        <View style={styles.container}>
            {/* Stats Header */}
            {scans.length > 0 && (
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{totalScans}</Text>
                        <Text style={styles.statLabel}>TOTAL SCANS</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{uniqueQRs}</Text>
                        <Text style={styles.statLabel}>UNIQUE QR</Text>
                    </View>
                </View>
            )}

            {/* List */}
            <FlatList
                data={scans}
                renderItem={renderItem}
                keyExtractor={(item) => item.qrCode}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={EmptyList}
            />

            {/* Clear All Button */}
            {scans.length > 0 && (
                <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
                    <Text style={styles.clearButtonText}>CLEAR ALL RECORDS</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    statsContainer: {
        flexDirection: 'row',
        padding: spacing.lg,
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
    },
    statValue: {
        fontSize: fontSize.xxxl,
        fontWeight: '900',
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    statLabel: {
        fontSize: fontSize.xs,
        fontWeight: '700',
        color: colors.textSecondary,
        textAlign: 'center',
        letterSpacing: 1.5,
    },
    listContent: {
        padding: spacing.lg,
        flexGrow: 1,
    },
    scanCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    scanHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: spacing.sm,
    },
    qrCode: {
        fontSize: fontSize.sm,
        fontWeight: '700',
        color: colors.text,
        flex: 1,
        marginRight: spacing.sm,
        fontFamily: 'monospace',
    },
    repeatBadge: {
        backgroundColor: colors.warning + '20',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.warning,
    },
    repeatText: {
        fontSize: fontSize.xs,
        fontWeight: '700',
        color: colors.warning,
        letterSpacing: 1,
    },
    dataPreview: {
        marginBottom: spacing.sm,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    previewItem: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    previewLabel: {
        fontSize: fontSize.xs,
        fontWeight: '700',
        color: colors.textSecondary,
        marginRight: spacing.xs,
        letterSpacing: 0.5,
    },
    previewValue: {
        fontSize: fontSize.xs,
        color: colors.text,
        flex: 1,
    },
    scanDetails: {
        flexDirection: 'row',
        gap: spacing.lg,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    detailLabel: {
        fontSize: fontSize.xs,
        fontWeight: '700',
        color: colors.textSecondary,
        letterSpacing: 1,
    },
    detailValue: {
        fontSize: fontSize.sm,
        fontWeight: '700',
        color: colors.text,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xxxl * 2,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    emptyIconText: {
        fontSize: 48,
        color: colors.textSecondary,
    },
    emptyTitle: {
        fontSize: fontSize.lg,
        fontWeight: '900',
        color: colors.text,
        marginBottom: spacing.sm,
        letterSpacing: 2,
    },
    emptyText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    clearButton: {
        backgroundColor: colors.error,
        margin: spacing.lg,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        ...shadows.md,
    },
    clearButtonText: {
        fontSize: fontSize.sm,
        fontWeight: '900',
        color: colors.surface,
        letterSpacing: 1.5,
    },
});
