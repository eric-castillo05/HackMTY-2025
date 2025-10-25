// challenge1/module1/components/StatCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../shared/theme/colors';

/**
 * Statistics card component for dashboard metrics
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {string} props.icon - Emoji icon
 * @param {string} [props.color] - Accent color (defaults to primary)
 * @param {string} [props.subtitle] - Optional subtitle text
 * @param {Function} [props.onPress] - Optional press handler
 */
export const StatCard = ({
                             title,
                             value,
                             icon,
                             color = colors.primary,
                             subtitle,
                             onPress
                         }) => {
    const CardWrapper = onPress ? TouchableOpacity : View;

    return (
        <CardWrapper
            style={[styles.card, { borderLeftColor: color }]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={styles.content}>
                {/* Icon */}
                <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                    <Text style={styles.icon}>{icon}</Text>
                </View>

                {/* Text Content */}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={[styles.value, { color }]}>{value}</Text>
                    {subtitle && (
                        <Text style={styles.subtitle}>{subtitle}</Text>
                    )}
                </View>
            </View>
        </CardWrapper>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderLeftWidth: 4,
        padding: spacing.md,
        ...shadows.sm,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: fontSize.xxl,
        lineHeight: fontSize.xxl + 4,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    value: {
        fontSize: fontSize.xl,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: fontSize.xs,
        color: colors.textLight,
        marginTop: 2,
    },
});