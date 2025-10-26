// challenge1/module1/screens/InventoryScreen.js
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
    Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../shared/theme/colors';
import { StorageService } from '../services/storageService';
import { ProductService } from '../services/productService';

export const InventoryScreen = ({ navigation, route }) => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState(route?.params?.filter || 'all');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const filters = [
        { label: 'Todos', value: 'all', color: colors.text },
        { label: 'Frescos', value: 'fresh', color: colors.fresh },
        { label: 'Usar Pronto', value: 'useSoon', color: colors.useSoon },
        { label: 'Críticos', value: 'critical', color: colors.critical },
        { label: 'Vencidos', value: 'expired', color: colors.error },
    ];

    useFocusEffect(
    useCallback(() => {
        loadProducts();
    }, [route?.params?.refresh]) // Agrega esta dependencia
);

    const loadProducts = async () => {
        try {
            const allProducts = await StorageService.getAllProducts();
            
            // Add freshness status and days_left to each product
            const productsWithStatus = allProducts.map(product => {
                try {
                    const daysLeft = StorageService.calculateDaysLeft(product.expiry_date);
                    const freshnessStatus = ProductService.getFreshnessStatus(product.expiry_date);
                    
                    return {
                        ...product,
                        days_left: daysLeft,
                        freshnessStatus: freshnessStatus,
                    };
                } catch (error) {
                    return {
                        ...product,
                        days_left: 0,
                        freshnessStatus: 'expired',
                    };
                }
            });
            
            // Sort by expiry date (closest first)
            const sorted = ProductService.sortProductsByExpiry(productsWithStatus, true);
            setProducts(sorted);
            applyFilters(sorted, selectedFilter, searchQuery);
        } catch (error) {
            // Error manejado silenciosamente
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadProducts();
        setRefreshing(false);
    };

    const applyFilters = (productList, filter, query) => {
        let filtered = [...productList];

        // Apply status filter
        if (filter !== 'all') {
            filtered = filtered.filter(p => p.freshnessStatus === filter);
        }

        // Apply search query
        if (query.trim() !== '') {
            const lowerQuery = query.toLowerCase();
            filtered = filtered.filter(
                p =>
                    (p.product_name && p.product_name.toLowerCase().includes(lowerQuery)) ||
                    (p.lotsName && p.lotsName.toLowerCase().includes(lowerQuery))
            );
        }

        setFilteredProducts(filtered);
    };

    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
        applyFilters(products, filter, searchQuery);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        applyFilters(products, selectedFilter, query);
    };

    const handleProductPress = (product) => {
        console.log('Navigating to ProductDetail with ID:', product.product_id);
        navigation.navigate('ProductDetail', { productId: product.product_id });
    };

    const getProductStatusColor = (daysLeft) => {
        if (daysLeft < 0) return colors.error;
        if (daysLeft <= 1) return colors.error;
        if (daysLeft <= 3) return colors.warning;
        return colors.success;
    };

    const getProductStatusText = (daysLeft) => {
        if (daysLeft < 0) return 'VENCIDO';
        if (daysLeft === 0) return 'VENCE HOY';
        if (daysLeft === 1) return 'CRÍTICO';
        if (daysLeft <= 3) return 'USAR PRONTO';
        return 'VIGENTE';
    };

    const formatDate = (dateString) => {
        try {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString('es-MX', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            });
        } catch (error) {
            return 'N/A';
        }
    };

    const renderProduct = ({ item }) => {
        const statusColor = getProductStatusColor(item.days_left);
        const statusText = getProductStatusText(item.days_left);

        return (
            <TouchableOpacity
                style={styles.productCard}
                onPress={() => handleProductPress(item)}
            >
                <View style={styles.productHeader}>
                    <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={1}>
                            {item.product_name || 'Sin nombre'}
                        </Text>
                        <Text style={styles.productLot}>Lote: {item.lotsName || 'N/A'}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={styles.statusBadgeText}>{statusText}</Text>
                    </View>
                </View>
                
                <View style={styles.productFooter}>
                    <View style={styles.productDetailItem}>
                        <Text style={styles.productDetailLabel}>Cantidad</Text>
                        <Text style={styles.productDetailValue}>{item.quantity || '0'} {item.mlg || 'ml'}</Text>
                    </View>
                    <View style={styles.productDetailItem}>
                        <Text style={styles.productDetailLabel}>Vence</Text>
                        <Text style={styles.productDetailValue}>
                            {formatDate(item.expiry_date)}
                        </Text>
                    </View>
                    <View style={styles.productDetailItem}>
                        <Text style={styles.productDetailLabel}>Días Restantes</Text>
                        <Text style={[styles.productDetailValue, styles.daysLeftValue, { color: statusColor }]}>
                            {item.days_left}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No hay productos</Text>
            <Text style={styles.emptyDescription}>
                {searchQuery
                    ? 'No se encontraron productos con ese criterio'
                    : 'Registra tu primer producto para comenzar'}
            </Text>
            {!searchQuery && (
                <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => navigation.navigate('RegisterLot')}
                >
                    <Text style={styles.emptyButtonText}>Registrar Producto</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por nombre o lote..."
                    placeholderTextColor={colors.textLight}
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
                {searchQuery !== '' && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => handleSearch('')}
                    >
                        <Text style={styles.clearButtonText}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter Chips */}
            <View style={styles.filtersContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={filters}
                    keyExtractor={(item) => item.value}
                    contentContainerStyle={styles.filtersContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                selectedFilter === item.value && {
                                    backgroundColor: item.color,
                                    borderColor: item.color,
                                }
                            ]}
                            onPress={() => handleFilterChange(item.value)}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    selectedFilter === item.value && styles.filterChipTextActive,
                                ]}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Results Count */}
            <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>
                    {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
                </Text>
                {selectedFilter !== 'all' && (
                    <TouchableOpacity onPress={() => handleFilterChange('all')}>
                        <Text style={styles.clearFilter}>Limpiar filtro</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Products List */}
            <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.product_id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('RegisterLot')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        marginHorizontal: spacing.lg,
        marginTop: Platform.OS === 'ios' ? spacing.md : spacing.lg,
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        ...shadows.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: fontSize.md,
        color: colors.text,
        paddingVertical: spacing.md,
    },
    clearButton: {
        padding: spacing.sm,
    },
    clearButtonText: {
        fontSize: fontSize.lg,
        color: colors.textLight,
    },
    filtersContainer: {
        marginBottom: spacing.md,
    },
    filtersContent: {
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
    },
    filterChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: spacing.sm,
    },
    filterChipText: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.text,
    },
    filterChipTextActive: {
        color: colors.surface,
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    resultsCount: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    clearFilter: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: '600',
    },
    productCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    productInfo: {
        flex: 1,
        marginRight: spacing.md,
    },
    productName: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    productLot: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        fontFamily: 'monospace',
    },
    statusBadge: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.sm,
    },
    statusBadgeText: {
        fontSize: fontSize.xs,
        fontWeight: '700',
        color: colors.surface,
        letterSpacing: 0.5,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: spacing.md,
    },
    productDetailItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    productDetailLabel: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        textTransform: 'uppercase',
        fontWeight: '500',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    productDetailValue: {
        fontSize: fontSize.sm,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
    },
    daysLeftValue: {
        fontSize: fontSize.sm,
    },
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: 80,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    emptyTitle: {
        fontSize: fontSize.xl,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    emptyDescription: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.xl,
    },
    emptyButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
    },
    emptyButtonText: {
        fontSize: fontSize.md,
        fontWeight: '700',
        color: colors.surface,
    },
    fab: {
        position: 'absolute',
        right: spacing.lg,
        bottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.lg,
    },
    fabText: {
        fontSize: fontSize.xxxl,
        color: colors.surface,
        fontWeight: '300',
    },
});