// challenge1/module1/components/QRCodeGenerator.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../shared/theme/colors';

/**
 * QR Code generator component with product info
 * @param {Object} props
 * @param {Object} props.product - Product object to encode
 * @param {number} [props.size=200] - QR code size in pixels
 * @param {boolean} [props.showDetails=true] - aShow product details below QR
 */
export const QRCodeGenerator = ({ product, size = 200, showDetails = true }) => {
    // Encode product data as JSON
    const qrData = JSON.stringify({
        id: product.id,
        lotNumber: product.lotNumber,
        productName: product.productName,
        expiryDate: product.expiryDate,
    });

    return (
        <View style={styles.container}>
            {/* QR Code */}
            <View style={styles.qrContainer}>
                <QRCode
                    value={qrData}
                    size={size}
                    backgroundColor={colors.surface}
                    color={colors.secondary}
                    logo={require('../../../assets/favicon.png')}
                    logoSize={40}
                    logoBackgroundColor={colors.surface}
                    logoBorderRadius={4}
                />
            </View>

            {/* Product Details */}
            {showDetails && (
                <View style={styles.details}>
                    <Text style={styles.productName} numberOfLines={2}>
                        {product.productName}
                    </Text>
                    <Text style={styles.lotNumber}>
                        Lote: {product.lotNumber}
                    </Text>
                    <View style={styles.idContainer}>
                        <Text style={styles.idLabel}>ID:</Text>
                        <Text style={styles.idValue}>{product.id}</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    qrContainer: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        ...shadows.md,
    },
    details: {
        marginTop: spacing.lg,
        alignItems: 'center',
        paddingHorizontal: spacing.md,
    },
    productName: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    lotNumber: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    idContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    idLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    idValue: {
        fontSize: fontSize.sm,
        color: colors.text,
        fontFamily: 'monospace',
    },
});