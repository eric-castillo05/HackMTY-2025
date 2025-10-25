// challenge1/module1/services/productService.js
import { StorageService } from './storageService';
import { getFreshnessStatus } from '../../shared/utils/dateUtils';

export class ProductService {
    /**
     * Create a new product from form data
     * Solo usa: productName, lotNumber, quantity, expiryDate
     */
    static async createProduct(formData) {
        const timestamp = Date.now().toString().slice(-6);
        const id = `PRD-${timestamp}`;
        const expiryDateISO = formData.expiryDate.toISOString().split('T')[0];

        // Calculate days left
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(expiryDateISO);
        expiry.setHours(0, 0, 0, 0);
        const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        const product = {
            id,
            productName: formData.productName,
            lotNumber: formData.lotNumber,
            quantity: parseInt(formData.quantity, 10),
            expiryDate: expiryDateISO,
            createdAt: new Date().toISOString(),
            status: daysLeft >= 0 ? 'VIGENTE' : 'VENCIDO',
            days_left: daysLeft
        };

        await StorageService.saveProduct(product);
        return product;
    }

    /**
     * Get dashboard statistics
     */
    static async getDashboardStats() {
        const products = await StorageService.getAllProducts();

        let freshProducts = 0;
        let useSoonProducts = 0;
        let criticalProducts = 0;
        let expiredProducts = 0;

        products.forEach(product => {
            const status = getFreshnessStatus(product.expiryDate);
            switch (status) {
                case 'fresh':
                    freshProducts++;
                    break;
                case 'useSoon':
                    useSoonProducts++;
                    break;
                case 'critical':
                    criticalProducts++;
                    break;
                case 'expired':
                    expiredProducts++;
                    break;
            }
        });

        const totalProducts = products.length;
        const freshnessPercentage = totalProducts > 0
            ? Math.round((freshProducts / totalProducts) * 100)
            : 100;

        return {
            totalProducts,
            freshProducts,
            useSoonProducts,
            criticalProducts,
            expiredProducts,
            freshnessPercentage,
        };
    }

    /**
     * Filter products by freshness status
     */
    static async getProductsByFreshness(status) {
        const products = await StorageService.getAllProducts();
        if (!status) return products;
        return products.filter(product =>
            getFreshnessStatus(product.expiryDate) === status
        );
    }

    /**
     * Get products expiring soon (next N days)
     */
    static async getProductsExpiringSoon(days = 3) {
        const products = await StorageService.getAllProducts();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() + days);

        return products.filter(product => {
            const expiryDate = new Date(product.expiryDate);
            return expiryDate <= targetDate && expiryDate >= today;
        });
    }

    /**
     * Update product quantity
     */
    static async updateQuantity(productId, newQuantity) {
        const product = await StorageService.getProductById(productId);
        if (product) {
            product.quantity = newQuantity;
            await StorageService.updateProduct(product);
        }
    }

    /**
     * Search products by text (name, lot)
     */
    static async searchProducts(query) {
        const products = await StorageService.getAllProducts();
        const lowerQuery = query.toLowerCase();

        return products.filter(product =>
            product.productName.toLowerCase().includes(lowerQuery) ||
            product.lotNumber.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Sort products by expiry date
     */
    static sortProductsByExpiry(products, ascending = true) {
        return [...products].sort((a, b) => {
            const dateA = new Date(a.expiryDate).getTime();
            const dateB = new Date(b.expiryDate).getTime();
            return ascending ? dateA - dateB : dateB - dateA;
        });
    }
}