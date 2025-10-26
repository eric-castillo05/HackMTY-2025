// challenge1/module1/services/productService.js
import { StorageService } from './storageService';

export class ProductService {
    /**
     * Create a new product from form data
     * Usa el nuevo formato: product_name, lotsName, quantity, expiry_date, mlg
     */
    static async createProduct(formData) {
        const timestamp = Date.now().toString().slice(-6);
        const product_id = `PRD-${timestamp}`;
        const expiryDateISO = formData.expiryDate.toISOString();

        // Calculate days left
        const daysLeft = StorageService.calculateDaysLeft(expiryDateISO);

        const product = {
            product_id,
            product_name: formData.productName,
            lotsName: formData.lotNumber,
            quantity: formData.quantity.toString(),
            expiry_date: expiryDateISO,
            status: daysLeft >= 0 ? 'VIGENTE' : 'VENCIDO',
            mlg: formData.unit || 'ml',
        };

        await StorageService.saveProduct(product);
        return product;
    }

    /**
     * Get dashboard statistics
     */
    static async getDashboardStats() {
        try {
            const products = await StorageService.getAllProducts();
            
            if (products.length === 0) {
                return {
                    totalProducts: 0,
                    freshProducts: 0,
                    useSoonProducts: 0,
                    criticalProducts: 0,
                    expiredProducts: 0,
                    freshnessPercentage: 100,
                };
            }

            let freshProducts = 0;
            let useSoonProducts = 0;
            let criticalProducts = 0;
            let expiredProducts = 0;

            products.forEach(product => {
                const daysLeft = StorageService.calculateDaysLeft(product.expiry_date);
                
                if (daysLeft < 0) {
                    expiredProducts++;
                } else if (daysLeft <= 1) {
                    criticalProducts++;
                } else if (daysLeft <= 3) {
                    useSoonProducts++;
                } else {
                    freshProducts++;
                }
            });

            // Calculate freshness percentage
            const totalActive = products.length - expiredProducts;
            const freshnessPercentage = totalActive > 0
                ? Math.round(((freshProducts + useSoonProducts * 0.5) / totalActive) * 100)
                : 100;

            return {
                totalProducts: products.length,
                freshProducts,
                useSoonProducts,
                criticalProducts,
                expiredProducts,
                freshnessPercentage,
            };
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            throw error;
        }
    }

    /**
     * Get freshness status for a product
     */
    static getFreshnessStatus(expiryDate) {
        const daysLeft = StorageService.calculateDaysLeft(expiryDate);
        
        if (daysLeft < 0) return 'expired';
        if (daysLeft <= 1) return 'critical';
        if (daysLeft <= 3) return 'useSoon';
        return 'fresh';
    }

    /**
     * Filter products by freshness status
     */
    static async getProductsByFreshness(status) {
        const products = await StorageService.getAllProducts();
        if (!status) return products;
        return products.filter(product =>
            this.getFreshnessStatus(product.expiry_date) === status
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
            const expiryDate = new Date(product.expiry_date);
            return expiryDate <= targetDate && expiryDate >= today;
        });
    }

    /**
     * Update product quantity
     */
    static async updateQuantity(productId, newQuantity) {
        const product = await StorageService.getProductById(productId);
        if (product) {
            product.quantity = newQuantity.toString();
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
            product.product_name.toLowerCase().includes(lowerQuery) ||
            product.lotsName.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Sort products by expiry date
     */
    static sortProductsByExpiry(products, ascending = true) {
        return [...products].sort((a, b) => {
            const dateA = new Date(a.expiry_date);
            const dateB = new Date(b.expiry_date);
            return ascending ? dateA - dateB : dateB - dateA;
        });
    }
}