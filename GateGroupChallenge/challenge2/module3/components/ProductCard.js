// challenge1/module1/components/ProductCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../shared/theme/colors';
import { CATEGORY_LABELS } from '../../shared/types';
import { formatShortDate } from '../../shared/utils/dateUtils';
import { FreshnessIndicator } from './FreshnessIndicator';

/**
 * Card component to display product information in lists
 * @param {Object} props
 * @param {Object} props.product - Product object
 * @param {Function} [props.onPress] - Callback when card is pressed
 */
export const ProductCard = ({ product, onPress }) => {
    const {
        productName,
        lotNumber,
        expiryDate,
        category,
        quantity,
        weight,
        location
    } = product;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Header Row */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.categoryEmoji}>
                        {CATEGORY_LABELS[category]?.split(' ')[0] || '📦'}
                    </Text>
                    <View style={styles.titleContainer}>
                        <Text style={styles.productName} numberOfLines={1}>
                            {productName}
                        </Text>
                        <Text style={styles.lotNumber}>Lote: {lotNumber}</Text>
                    </View>
                </View>
                <FreshnessIndicator
                    expiryDate={expiryDate}
                    size="small"
                    showLabel={false}
                />
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Details Grid */}
            <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>📅 Expira</Text>
                    <Text style={styles.detailValue}>{formatShortDate(expiryDate)}</Text>
                </View>

                <View style={[styles.detailItem, styles.quantityContainer]}>
                    <Text style={styles.detailLabel}>📦 Cantidad</Text>
                    <View style={styles.quantityControls}>
                        <TouchableOpacity 
                            style={styles.quantityButton} 
                            onPress={() => onPress?.(product, 'decrease')}
                        >
                            <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityValue}>{quantity}</Text>
                        <TouchableOpacity 
                            style={styles.quantityButton} 
                            onPress={() => onPress?.(product, 'increase')}
                        >
                            <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>⚖️ Peso</Text>
                    <Text style={styles.detailValue}>{weight} kg</Text>
                </View>

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>📍 Ubicación</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>
                        {location}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    headerLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginRight: spacing.sm,
    },
    categoryEmoji: {
        fontSize: fontSize.xxl,
        lineHeight: fontSize.xxl + 4,
    },
    titleContainer: {
        flex: 1,
    },
    productName: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    lotNumber: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.sm,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    detailItem: {
        width: '47%',
    },
    detailLabel: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: fontSize.sm,
        fontWeight: '500',
        color: colors.text,
    },
    quantityContainer: {
        flex: 1,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.background,
        borderRadius: borderRadius.sm,
        padding: 4,
        marginTop: 4,
    },
    quantityButton: {
        width: 28,
        height: 28,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        fontSize: fontSize.md,
        color: colors.surface,
        fontWeight: '600',
    },
    quantityValue: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text,
        marginHorizontal: spacing.sm,
    },
});