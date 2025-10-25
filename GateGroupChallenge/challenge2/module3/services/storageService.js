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
            products.push(product);
            await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
            return product;
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
            const index = products.findIndex(p => p.id === updatedProduct.id);

            if (index !== -1) {
                products[index] = updatedProduct;
                await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
                return updatedProduct;
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
            const filtered = products.filter(p => p.id !== productId);
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
            return products.find(p => p.id === productId) || null;
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
                id: 'PRD-001',
                productName: 'Pechuga de Pollo Premium',
                lotNumber: 'LOT-A-2024-10',
                expiryDate: '2025-10-28',
                quantity: 12,
                createdAt: new Date().toISOString(),
                status: 'VIGENTE',
                days_left: 3,
            },
            {
                id: 'PRD-002',
                productName: 'Leche Entera 1L',
                lotNumber: 'LOT-B-2024-10',
                expiryDate: '2025-10-30',
                quantity: 48,
                createdAt: new Date().toISOString(),
                status: 'VIGENTE',
                days_left: 5,
            },
            {
                id: 'PRD-003',
                productName: 'Pan Baguette',
                lotNumber: 'LOT-C-2024-10',
                expiryDate: '2025-10-26',
                quantity: 96,
                createdAt: new Date().toISOString(),
                status: 'VIGENTE',
                days_left: 1,
            },
        ];

        for (const product of testProducts) {
            await this.saveProduct(product);
        }

        console.log('Test data seeded successfully');
    }
}