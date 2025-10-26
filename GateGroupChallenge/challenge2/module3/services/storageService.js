// challenge1/module1/services/storageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

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
            console.error('Error reading products:', error);
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
                product_name: product.product_name,
                lotsName: product.lotsName,
                expiry_date: product.expiry_date,
                quantity: product.quantity,
                status: product.status || 'VIGENTE',
                mlg: product.mlg || 'ml', // 'ml' o 'mg'
            };
            
            products.push(formattedProduct);
            await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
            return formattedProduct;
        } catch (error) {
            console.error('Error saving product:', error);
            throw error;
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
                    product_name: updatedProduct.product_name,
                    lotsName: updatedProduct.lotsName,
                    expiry_date: updatedProduct.expiry_date,
                    quantity: updatedProduct.quantity,
                    status: updatedProduct.status || 'VIGENTE',
                    mlg: updatedProduct.mlg || 'ml',
                };
                
                products[index] = formattedProduct;
                await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
                return formattedProduct;
            }
            return null;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
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
            console.error('Error deleting product:', error);
            throw error;
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
            console.error('Error finding product:', error);
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
            console.error('Error clearing products:', error);
            throw error;
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
            console.error('Error calculating days left:', error);
            return 0;
        }
    }

    /**
     * Seed test data
     */
    static async seedTestData() {
        const existing = await this.getAllProducts();
        if (existing.length > 0) {
            console.log('Test data already exists, skipping seed');
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

        console.log('Test data seeded successfully');
    }
}