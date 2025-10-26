// challenge1/shared/services/productService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, createProductFromQR } from '../models/ProductModel';
import { ErrorHandler } from '../../../shared/services/errorHandler';

const PRODUCTS_KEY = '@airplane_products';

/**
 * Service to manage product inventory
 */
export class ProductService {
    /**
     * Get all products from storage
     */
    static async getAllProducts() {
        try {
            const data = await AsyncStorage.getItem(PRODUCTS_KEY);
            const products = data ? JSON.parse(data) : [];
            return products.map(p => new Product(p));
        } catch (error) {
            ErrorHandler.logError('ProductService.getAllProducts', error);
            return [];
        }
    }

    /**
     * Save a product from QR scan
     */
    static async saveProductFromQR(qrData) {
        try {
            const product = createProductFromQR(qrData);
            const products = await this.getAllProducts();
            
            // Check if product already exists (by batch number)
            const existingIndex = products.findIndex(
                p => p.batchNumber === product.batchNumber
            );
            
            if (existingIndex !== -1) {
                // Update existing product
                products[existingIndex] = product;
            } else {
                // Add new product
                products.push(product);
            }
            
            await AsyncStorage.setItem(
                PRODUCTS_KEY, 
                JSON.stringify(products.map(p => p.toJSON()))
            );
            
            return product;
        } catch (error) {
            ErrorHandler.logError('ProductService.saveProductFromQR', error);
            return null;
        }
    }

    /**
     * Get product by ID or batch number
     */
    static async getProduct(identifier) {
        try {
            const products = await this.getAllProducts();
            return products.find(
                p => p.id === identifier || p.batchNumber === identifier
            ) || null;
        } catch (error) {
            ErrorHandler.logError('ProductService.getProduct', error);
            return null;
        }
    }

    /**
     * Update product quantity
     */
    static async updateQuantity(productId, newQuantity) {
        try {
            const products = await this.getAllProducts();
            const product = products.find(p => p.id === productId);
            
            if (product) {
                product.quantity = newQuantity;
                product.updatedAt = new Date().toISOString();
                
                await AsyncStorage.setItem(
                    PRODUCTS_KEY,
                    JSON.stringify(products.map(p => p.toJSON()))
                );
            }
            
            return product;
        } catch (error) {
            ErrorHandler.logError('ProductService.updateQuantity', error);
            return null;
        }
    }

    /**
     * Delete a product
     */
    static async deleteProduct(productId) {
        try {
            const products = await this.getAllProducts();
            const filtered = products.filter(p => p.id !== productId);
            
            await AsyncStorage.setItem(
                PRODUCTS_KEY,
                JSON.stringify(filtered.map(p => p.toJSON()))
            );
        } catch (error) {
            ErrorHandler.logError('ProductService.deleteProduct', error);
        }
    }

    /**
     * Get products grouped by expiration date
     */
    static async getProductsByExpiration() {
        try {
            const products = await this.getAllProducts();
            
            const grouped = {
                expired: [],
                expiringSoon: [], // within 2 days
                fresh: [],
            };
            
            products.forEach(product => {
                if (product.isExpired()) {
                    grouped.expired.push(product);
                } else if (product.isExpiringSoon(2)) {
                    grouped.expiringSoon.push(product);
                } else {
                    grouped.fresh.push(product);
                }
            });
            
            return grouped;
        } catch (error) {
            ErrorHandler.logError('ProductService.getProductsByExpiration', error);
            return { expired: [], expiringSoon: [], fresh: [] };
        }
    }

    /**
     * Get products grouped by category
     */
    static async getProductsByCategory() {
        try {
            const products = await this.getAllProducts();
            const grouped = {};
            
            products.forEach(product => {
                const category = product.category || 'Uncategorized';
                if (!grouped[category]) {
                    grouped[category] = [];
                }
                grouped[category].push(product);
            });
            
            return grouped;
        } catch (error) {
            ErrorHandler.logError('ProductService.getProductsByCategory', error);
            return {};
        }
    }

    /**
     * Get products grouped by location
     */
    static async getProductsByLocation() {
        try {
            const products = await this.getAllProducts();
            const grouped = {};
            
            products.forEach(product => {
                const location = product.location || 'Unknown';
                if (!grouped[location]) {
                    grouped[location] = [];
                }
                grouped[location].push(product);
            });
            
            return grouped;
        } catch (error) {
            ErrorHandler.logError('ProductService.getProductsByLocation', error);
            return {};
        }
    }

    /**
     * Get products for a specific flight
     */
    static async getProductsByFlight(flightNumber) {
        try {
            const products = await this.getAllProducts();
            return products.filter(p => p.flightNumber === flightNumber);
        } catch (error) {
            ErrorHandler.logError('ProductService.getProductsByFlight', error);
            return [];
        }
    }

    /**
     * Get statistics
     */
    static async getStatistics() {
        try {
            const products = await this.getAllProducts();
            const byExpiration = await this.getProductsByExpiration();
            
            return {
                totalProducts: products.length,
                totalQuantity: products.reduce((sum, p) => sum + p.quantity, 0),
                expired: byExpiration.expired.length,
                expiringSoon: byExpiration.expiringSoon.length,
                fresh: byExpiration.fresh.length,
                averageFreshness: products.length > 0
                    ? Math.round(
                        products.reduce((sum, p) => sum + p.calculateFreshness(), 0) / products.length
                    )
                    : 0,
            };
        } catch (error) {
            ErrorHandler.logError('ProductService.getStatistics', error);
            return {
                totalProducts: 0,
                totalQuantity: 0,
                expired: 0,
                expiringSoon: 0,
                fresh: 0,
                averageFreshness: 0,
            };
        }
    }

    /**
     * Clear all products (for testing)
     */
    static async clearAll() {
        try {
            await AsyncStorage.removeItem(PRODUCTS_KEY);
        } catch (error) {
            ErrorHandler.logError('ProductService.clearAll', error);
        }
    }
}
