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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../shared/theme/colors';
import { StorageService } from '../services/storageService';
import { ProductService } from '../services/productService';
import { ProductCard } from '../components/ProductCard';
import { getFreshnessStatus } from '../../shared/utils/dateUtils';

export const InventoryScreen = ({ navigation, route }) => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState(route.params?.filter || 'all');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const filters = [
        { label: 'Todos', value: 'all', emoji: '📦' },
        { label: 'Frescos', value: 'fresh', emoji: '🟢' },
        { label: 'Usar Pronto', value: 'useSoon', emoji: '🟡' },
        { label: 'Críticos', value: 'critical', emoji: '🔴' },
        { label: 'Vencidos', value: 'expired', emoji: '⚫' },
    ];

    useFocusEffect(
        useCallback(() => {
            loadProducts();
        }, [])
    );

    const loadProducts = async () => {
        try {
            const allProducts = await StorageService.getAllProducts();
            // Add freshness status to each product
            const productsWithStatus = allProducts.map(product => ({
                ...product,
                freshnessStatus: getFreshnessStatus(product.expiryDate),
            }));
            // Sort by expiry date (closest first)
            const sorted = ProductService.sortProductsByExpiry(productsWithStatus, true);
            setProducts(sorted);
            applyFilters(sorted, selectedFilter, searchQuery);
        } catch (error) {
            console.error('Error loading products:', error);
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
                    p.productName.toLowerCase().includes(lowerQuery) ||
                    p.lotNumber.toLowerCase().includes(lowerQuery) ||
                    p.location.toLowerCase().includes(lowerQuery)
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
        navigation.navigate('ProductDetail', { productId: product.id });
    };

    const renderProduct = ({ item }) => (
        <ProductCard product={item} onPress={() => handleProductPress(item)} />
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
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
                    <Text style={styles.emptyButtonText}>➕ Registrar Producto</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por nombre, lote o ubicación..."
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
                                selectedFilter === item.value && styles.filterChipActive,
                            ]}
                            onPress={() => handleFilterChange(item.value)}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    selectedFilter === item.value && styles.filterChipTextActive,
                                ]}
                            >
                                {item.emoji} {item.label}
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
                keyExtractor={(item) => item.id}
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
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        margin: spacing.lg,
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
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
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
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: 80,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: spacing.lg,
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
        bottom: spacing.lg,
        width: 56,
        height: 56,
        borderRadius: borderRadius.full,
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