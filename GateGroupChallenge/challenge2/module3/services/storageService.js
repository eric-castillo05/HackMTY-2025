// challenge1/module1/services/storageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorHandler } from '../../../shared/services/errorHandler';

const PRODUCTS_KEY = '@gategroup_products';

/**
 * Service to handle local product storage
 */
export class StorageService {
    /**
     * Get all products
     */
    static async getAllProducts() {
        try {
            const data = await AsyncStorage.getItem(PRODUCTS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            ErrorHandler.logError('StorageService.getAllProducts', error);
            return [];
        }
    }

    /**
     * Save a new product
     */
    static async saveProduct(product) {
        try {
            const products = await this.getAllProducts();
            
            // Formatear el producto según el esquema requerido
            const formattedProduct = {
                product_id: product.product_id || `PRD-${Date.now()}`,
                uuidProduct: product.uuidProduct || '',
                product_name: product.product_name,
                lotsName: product.lotsName,
                expiry_date: product.expiry_date,
                quantity: product.quantity,
                urlImage: product.urlImage || '',
                status: product.status || 'VIGENTE',
                mlg: product.mlg || 'ml', // 'ml' o 'mg'
            };
            
            products.push(formattedProduct);
            await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
            return formattedProduct;
        } catch (error) {
            ErrorHandler.logError('StorageService.saveProduct', error);
            return null;
        }
    }

    /**
     * Update an existing product
     */
    static async updateProduct(updatedProduct) {
        try {
            const products = await this.getAllProducts();
            const index = products.findIndex(p => p.product_id === updatedProduct.product_id);

            if (index !== -1) {
                // Mantener el formato correcto
                const formattedProduct = {
                    product_id: updatedProduct.product_id,
                    uuidProduct: updatedProduct.uuidProduct || '',
                    product_name: updatedProduct.product_name,
                    lotsName: updatedProduct.lotsName,
                    expiry_date: updatedProduct.expiry_date,
                    quantity: updatedProduct.quantity,
                    urlImage: updatedProduct.urlImage || '',
                    status: updatedProduct.status || 'VIGENTE',
                    mlg: updatedProduct.mlg || 'ml',
                };
                
                products[index] = formattedProduct;
                await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
                return formattedProduct;
            }
            return null;
        } catch (error) {
            ErrorHandler.logError('StorageService.updateProduct', error);
            return null;
        }
    }

    /**
     * Delete a product
     */
    static async deleteProduct(productId) {
        try {
            const products = await this.getAllProducts();
            const filtered = products.filter(p => p.product_id !== productId);
            await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
            return true;
        } catch (error) {
            ErrorHandler.logError('StorageService.deleteProduct', error);
            return false;
        }
    }

    /**
     * Find product by ID
     */
    static async getProductById(productId) {
        try {
            const products = await this.getAllProducts();
            return products.find(p => p.product_id === productId) || null;
        } catch (error) {
            ErrorHandler.logError('StorageService.getProductById', error);
            return null;
        }
    }

    /**
     * Clear all products (for testing)
     */
    static async clearAllProducts() {
        try {
            await AsyncStorage.removeItem(PRODUCTS_KEY);
        } catch (error) {
            ErrorHandler.logError('StorageService.clearAllProducts', error);
        }
    }

    /**
     * Calculate days left until expiry
     */
    static calculateDaysLeft(expiryDate) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const expiry = new Date(expiryDate);
            expiry.setHours(0, 0, 0, 0);
            const diffTime = expiry - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        } catch (error) {
            ErrorHandler.logError('StorageService.calculateDaysLeft', error);
            return 0;
        }
    }

    /**
     * Seed test data
     */
    static async seedTestData() {
        const existing = await this.getAllProducts();
        if (existing.length > 0) {
            return;
        }

        const testProducts = [
            {
                product_id: 'PRD-001',
                product_name: 'Pechuga de Pollo Premium',
                lotsName: 'LOT-A-2024-10',
                expiry_date: '2025-10-28T08:00:00',
                quantity: '12',
                status: 'VIGENTE',
                mlg: 'mg',
            },
            {
                product_id: 'PRD-002',
                product_name: 'Leche Entera 1L',
                lotsName: 'LOT-B-2024-10',
                expiry_date: '2025-10-30T08:00:00',
                quantity: '48',
                status: 'VIGENTE',
                mlg: 'ml',
            },
            {
                product_id: 'PRD-003',
                product_name: 'Pan Baguette',
                lotsName: 'LOT-C-2024-10',
                expiry_date: '2025-10-26T08:00:00',
                quantity: '96',
                status: 'VIGENTE',
                mlg: 'mg',
            },
        ];

        for (const product of testProducts) {
            await this.saveProduct(product);
        }
    }
}
