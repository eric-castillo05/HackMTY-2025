// challenge1/module1/screens/ProductDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../shared/theme/colors';
import { StorageService } from '../services/storageService';

export const ProductDetailScreen = ({ navigation, route }) => {
    const { productId } = route.params;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('ProductDetailScreen mounted with productId:', productId);
        loadProduct();
    }, [productId]);

    const formatDisplayDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'N/A';
        }
    };

    const loadProduct = async () => {
        console.log('Loading product with ID:', productId);

        if (!productId) {
            console.error('No product ID provided in route params');
            Alert.alert('Error', 'ID de producto no válido');
            navigation.goBack();
            return;
        }

        try {
            const foundProduct = await StorageService.getProductById(productId);
            console.log('Product found:', foundProduct);
            
            if (!foundProduct) {
                console.error('Product not found with ID:', productId);
                Alert.alert('Error', 'Producto no encontrado');
                navigation.goBack();
                return;
            }
            
            // Calculate days left
            const daysLeft = StorageService.calculateDaysLeft(foundProduct.expiry_date);
            foundProduct.days_left = daysLeft;
            
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
            'Eliminar Producto',
            `¿Estás seguro de eliminar "${product.product_name}"?`,
            [
                { 
                    text: 'Cancelar', 
                    style: 'cancel' 
                },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('Deleting product with ID:', productId);
                            const result = await StorageService.deleteProduct(productId);
                            console.log('Delete result:', result);
                            
                            if (result) {
                                // Usar goBack() en lugar de navigate para volver a la pantalla anterior
                                navigation.goBack();
                                
                                // Mostrar confirmación después de un pequeño delay
                                setTimeout(() => {
                                    Alert.alert('Éxito', 'El producto ha sido eliminado');
                                }, 300);
                            } else {
                                Alert.alert('Error', 'No se pudo eliminar el producto');
                            }
                        } catch (error) {
                            console.error('Error deleting product:', error);
                            Alert.alert('Error', 'No se pudo eliminar el producto. Intenta nuevamente.');
                        }
                    },
                },
            ]
        );
    };

    const getStatusColor = (daysLeft) => {
        if (daysLeft < 0) return colors.error;
        if (daysLeft <= 1) return colors.error;
        if (daysLeft <= 3) return colors.warning;
        return colors.success;
    };

    const getStatusText = (daysLeft) => {
        if (daysLeft < 0) return 'VENCIDO';
        if (daysLeft === 0) return 'VENCE HOY';
        if (daysLeft === 1) return 'CRÍTICO';
        if (daysLeft <= 3) return 'USAR PRONTO';
        return 'VIGENTE';
    };

    if (loading || !product) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    const statusColor = getStatusColor(product.days_left);
    const statusText = getStatusText(product.days_left);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Product Info Card */}
            <View style={styles.infoCard}>
                {/* Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.headerText}>
                        <Text style={styles.productName}>{product.product_name}</Text>
                    </View>
                </View>

                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusText}>{statusText}</Text>
                </View>

                {/* Details Grid */}
                <View style={styles.detailsSection}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>ID del Producto</Text>
                        <Text style={[styles.detailValue, styles.monoText]}>{product.product_id}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Número de Lote</Text>
                        <Text style={[styles.detailValue, styles.monoText]}>{product.lotsName}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Cantidad</Text>
                        <Text style={styles.detailValue}>{product.quantity} {product.mlg}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Unidad</Text>
                        <Text style={styles.detailValue}>
                            {product.mlg === 'ml' ? 'Mililitros' : 'Miligramos'}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Fecha de Expiración</Text>
                        <Text style={styles.detailValue}>
                            {formatDisplayDate(product.expiry_date)}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Días Restantes</Text>
                        <Text style={[styles.detailValue, { color: statusColor }]}>
                            {product.days_left} días
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Estado</Text>
                        <Text style={[styles.detailValue, { color: statusColor }]}>
                            {product.status}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Delete Button */}
            <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
            >
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                    Eliminar Producto
                </Text>
            </TouchableOpacity>
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
    headerText: {
        flex: 1,
    },
    productName: {
        fontSize: fontSize.xl,
        fontWeight: '700',
        color: colors.text,
    },
    statusBadge: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        alignSelf: 'flex-start',
        marginBottom: spacing.lg,
    },
    statusText: {
        color: colors.surface,
        fontWeight: '700',
        fontSize: fontSize.md,
    },
    detailsSection: {
        gap: spacing.md,
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
    actionButton: {
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        ...shadows.sm,
    },
    deleteButton: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.error,
    },
    actionButtonText: {
        fontSize: fontSize.md,
        fontWeight: '700',
    },
    deleteButtonText: {
        color: colors.error,
    },
});