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
            }
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
     * Find product by QR code or LOT number
     */
    static async getProductByQR(qrCode) {
        try {
            const products = await this.getAllProducts();
            return products.find(p =>
                p.qrCode === qrCode ||
                qrCode.includes(p.lotNumber) ||
                qrCode.includes(p.id)
            ) || null;
        } catch (error) {
            console.error('Error finding product by QR:', error);
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
                weight: '5.2 kg',
                quantity: 12,
                category: 'meat',
                location: 'Refrigerator A3',
                createdAt: new Date().toISOString(),
                qrCode: 'QR-PRD001-LOTA-20241028',
            },
            {
                id: 'PRD-002',
                productName: 'Leche Entera 1L',
                lotNumber: 'LOT-B-2024-10',
                expiryDate: '2025-10-30',
                weight: '1 L',
                quantity: 48,
                category: 'dairy',
                location: 'Refrigerator B1',
                createdAt: new Date().toISOString(),
                qrCode: 'QR-PRD002-LOTB-20241030',
            },
            {
                id: 'PRD-003',
                productName: 'Pan Baguette',
                lotNumber: 'LOT-C-2024-10',
                expiryDate: '2025-10-26',
                weight: '80g',
                quantity: 96,
                category: 'bakery',
                location: 'Bakery Area',
                createdAt: new Date().toISOString(),
                qrCode: 'QR-PRD003-LOTC-20241026',
            },
            {
                id: 'PRD-004',
                productName: 'Agua Mineral 500ml',
                lotNumber: 'LOT-D-2024-10',
                expiryDate: '2025-11-15',
                weight: '500ml',
                quantity: 240,
                category: 'beverages',
                location: 'General Warehouse',
                createdAt: new Date().toISOString(),
                qrCode: 'QR-PRD004-LOTD-20241115',
            },
            {
                id: 'PRD-005',
                productName: 'Ensalada César',
                lotNumber: 'LOT-E-2024-10',
                expiryDate: '2025-10-25',
                weight: '250g',
                quantity: 30,
                category: 'vegetables',
                location: 'Refrigerator C2',
                createdAt: new Date().toISOString(),
                qrCode: 'QR-PRD005-LOTE-20241025',
            },
        ];

        for (const product of testProducts) {
            await this.saveProduct(product);
        }

        console.log('Test data seeded successfully');
    }
}