// challenge1/module1/components/FreshnessIndicator.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../../shared/theme/colors';
import {
    getFreshnessStatus,
    getFreshnessColor,
    getFreshnessEmoji,
    getFreshnessLabel,
    getExpiryMessage
} from '../../shared/utils/dateUtils';

/**
 * Component that displays freshness status with visual indicators
 * @param {Object} props
 * @param {string} props.expiryDate - ISO date string
 * @param {string} [props.size='medium'] - 'small' | 'medium' | 'large'
 * @param {boolean} [props.showLabel=true] - Show text label
 * @param {boolean} [props.showMessage=false] - Show expiry message
 */
export const FreshnessIndicator = ({
                                       expiryDate,
                                       size = 'medium',
                                       showLabel = true,
                                       showMessage = false
                                   }) => {
    const status = getFreshnessStatus(expiryDate);
    const color = getFreshnessColor(status);
    const emoji = getFreshnessEmoji(status);
    const label = getFreshnessLabel(status);
    const message = getExpiryMessage(expiryDate);

    const sizeStyles = {
        small: {
            dot: { width: 8, height: 8 },
            emoji: { fontSize: fontSize.sm },
            label: { fontSize: fontSize.xs },
            message: { fontSize: fontSize.xs }
        },
        medium: {
            dot: { width: 12, height: 12 },
            emoji: { fontSize: fontSize.md },
            label: { fontSize: fontSize.sm },
            message: { fontSize: fontSize.sm }
        },
        large: {
            dot: { width: 16, height: 16 },
            emoji: { fontSize: fontSize.lg },
            label: { fontSize: fontSize.md },
            message: { fontSize: fontSize.md }
        }
    };

    const currentSize = sizeStyles[size];

    return (
        <View style={styles.container}>
            {/* Emoji Badge */}
            <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
                <Text style={[styles.emoji, currentSize.emoji]}>{emoji}</Text>
            </View>

            {/* Text Content */}
            {(showLabel || showMessage) && (
                <View style={styles.textContainer}>
                    {showLabel && (
                        <Text style={[styles.label, currentSize.label, { color }]}>
                            {label}
                        </Text>
                    )}
                    {showMessage && (
                        <Text style={[styles.message, currentSize.message]}>
                            {message}
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    badge: {
        width: 32,
        height: 32,
        borderRadius: borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        lineHeight: fontSize.md + 2,
    },
    textContainer: {
        flex: 1,
    },
    label: {
        fontWeight: '600',
    },
    message: {
        color: colors.textSecondary,
        marginTop: 2,
    },
});