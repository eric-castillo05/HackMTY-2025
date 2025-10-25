// challenge1/module1/services/productService.js
const { StorageService } = require('./storageService');
const { getFreshnessStatus } = require('../../shared/utils/dateUtils');

class ProductService {
    /**
     * Create a new product from form data
     */
    static async createProduct(formData) {
        const timestamp = Date.now().toString().slice(-6);
        const id = `PRD-${timestamp}`;
        const expiryDateISO = formData.expiryDate.toISOString().split('T')[0];
        const qrCode = `QR-${id}-${formData.lotNumber}-${expiryDateISO.replace(/-/g, '')}`;

        const product = {
            id,
            productName: formData.productName,
            lotNumber: formData.lotNumber,
            expiryDate: expiryDateISO,
            weight: formData.weight,
            quantity: parseInt(formData.quantity, 10),
            category: formData.category,
            location: formData.location,
            createdAt: new Date().toISOString(),
            qrCode,
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
     * Filter products by category
     */
    static async getProductsByCategory(category) {
        const products = await StorageService.getAllProducts();
        return products.filter(p => p.category === category);
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
     * Search products by text (name, lot, location)
     */
    static async searchProducts(query) {
        const products = await StorageService.getAllProducts();
        const lowerQuery = query.toLowerCase();

        return products.filter(product =>
            product.productName.toLowerCase().includes(lowerQuery) ||
            product.lotNumber.toLowerCase().includes(lowerQuery) ||
            product.location.toLowerCase().includes(lowerQuery)
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

    /**
     * Get category summary
     */
    static async getCategorySummary() {
        const products = await StorageService.getAllProducts();
        const summary = {};

        products.forEach(product => {
            summary[product.category] = (summary[product.category] || 0) + 1;
        });

        return summary;
    }
}

module.exports = { ProductService };