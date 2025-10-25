// challenge1/module1/screens/ProductDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Share,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../shared/theme/colors';
import { CATEGORY_LABELS } from '../../shared/types';
import { StorageService } from '../services/storageService';
import { FreshnessIndicator } from '../components/FreshnessIndicator';
import { QRCodeGenerator } from '../components/QRCodeGenerator';
import { formatDisplayDate } from '../../shared/utils/dateUtils';

export const ProductDetailScreen = ({ navigation, route }) => {
    const { productId } = route.params;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProduct();
    }, [productId]);

    const loadProduct = async () => {
        try {
            const foundProduct = await StorageService.getProductById(productId);
            setProduct(foundProduct);
        } catch (error) {
            console.error('Error loading product:', error);
            Alert.alert('Error', 'No se pudo cargar el producto');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            '⚠️ Eliminar Producto',
            `¿Estás seguro de eliminar "${product.productName}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        await StorageService.deleteProduct(productId);
                        Alert.alert('✅ Eliminado', 'El producto ha sido eliminado');
                        navigation.navigate('Home');
                    },
                },
            ]
        );
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `
📦 ${product.productName}
Lote: ${product.lotNumber}
📅 Expira: ${formatDisplayDate(product.expiryDate)}
📍 Ubicación: ${product.location}
⚖️ Peso: ${product.weight}
🔢 Cantidad: ${product.quantity} unidades
                `.trim(),
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    if (loading || !product) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* QR Code Section */}
            <View style={styles.qrSection}>
                <QRCodeGenerator product={product} size={200} showDetails={false} />
            </View>

            {/* Product Info Card */}
            <View style={styles.infoCard}>
                {/* Header */}
                <View style={styles.cardHeader}>
                    <Text style={styles.categoryEmoji}>
                        {CATEGORY_LABELS[product.category]?.split(' ')[0] || '📦'}
                    </Text>
                    <View style={styles.headerText}>
                        <Text style={styles.productName}>{product.productName}</Text>
                        <Text style={styles.category}>
                            {CATEGORY_LABELS[product.category]}
                        </Text>
                    </View>
                </View>

                {/* Freshness Status */}
                <View style={styles.statusSection}>
                    <FreshnessIndicator
                        expiryDate={product.expiryDate}
                        size="large"
                        showLabel={true}
                        showMessage={true}
                    />
                </View>

                {/* Details Grid */}
                <View style={styles.detailsSection}>
                    <Text style={styles.sectionTitle}>Detalles del Producto</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>🏷️ Número de Lote</Text>
                        <Text style={styles.detailValue}>{product.lotNumber}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>📅 Fecha de Expiración</Text>
                        <Text style={styles.detailValue}>
                            {formatDisplayDate(product.expiryDate)}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>⚖️ Peso</Text>
                        <Text style={styles.detailValue}>{product.weight}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>📦 Cantidad</Text>
                        <Text style={styles.detailValue}>{product.quantity} unidades</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>📍 Ubicación</Text>
                        <Text style={styles.detailValue}>{product.location}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>🆔 ID del Producto</Text>
                        <Text style={[styles.detailValue, styles.monoText]}>
                            {product.id}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>📅 Registrado</Text>
                        <Text style={styles.detailValue}>
                            {formatDisplayDate(product.createdAt)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsSection}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.shareButton]}
                    onPress={handleShare}
                >
                    <Text style={styles.actionButtonText}>📤 Compartir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={handleDelete}
                >
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                        🗑️ Eliminar
                    </Text>
                </TouchableOpacity>
            </View>

            {/* QR Code Info */}
            <View style={styles.qrInfo}>
                <Text style={styles.qrInfoTitle}>💡 Sobre el Código QR</Text>
                <Text style={styles.qrInfoText}>
                    Este código QR contiene toda la información del producto. Puedes imprimirlo
                    y pegarlo en el producto físico para facilitar su identificación y
                    seguimiento.
                </Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    loadingText: {
        fontSize: fontSize.lg,
        color: colors.textSecondary,
    },
    qrSection: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    infoCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        ...shadows.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        paddingBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    categoryEmoji: {
        fontSize: 48,
        marginRight: spacing.md,
    },
    headerText: {
        flex: 1,
    },
    productName: {
        fontSize: fontSize.xl,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    category: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    statusSection: {
        marginBottom: spacing.lg,
        paddingBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    detailsSection: {
        gap: spacing.md,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    detailLabel: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        flex: 1,
    },
    detailValue: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'right',
        flex: 1,
    },
    monoText: {
        fontFamily: 'monospace',
        fontSize: fontSize.sm,
    },
    actionsSection: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    actionButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        ...shadows.sm,
    },
    shareButton: {
        backgroundColor: colors.primary,
    },
    deleteButton: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.error,
    },
    actionButtonText: {
        fontSize: fontSize.md,
        fontWeight: '700',
        color: colors.surface,
    },
    deleteButtonText: {
        color: colors.error,
    },
    qrInfo: {
        backgroundColor: `${colors.info}15`,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: colors.info,
    },
    qrInfoTitle: {
        fontSize: fontSize.md,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    qrInfoText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        lineHeight: fontSize.sm * 1.5,
    },
});