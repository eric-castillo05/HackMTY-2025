// challenge1/shared/models/ProductModel.js

/**
 * Product model for airplane meal management
 */
export class Product {
    constructor(data) {
        this.id = data.id || null;
        this.batchNumber = data.batchNumber || '';
        this.productName = data.productName || '';
        this.sku = data.sku || '';
        this.category = data.category || ''; // 'Hot Meal', 'Cold Meal', 'Snack', 'Beverage'
        this.weight = data.weight || 0; // in grams
        this.quantity = data.quantity || 0; // units available
        this.expirationDate = data.expirationDate || null; // ISO date string
        this.productionDate = data.productionDate || null;
        this.location = data.location || ''; // Galley A, Refrigerator 1, etc.
        this.flightNumber = data.flightNumber || null;
        this.flightDate = data.flightDate || null;
        this.freshnessScore = data.freshnessScore || 100;
        this.temperature = data.temperature || null; // in celsius
        this.qrCode = data.qrCode || '';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    /**
     * Calculate days remaining until expiration
     */
    getDaysRemaining() {
        if (!this.expirationDate) return null;
        
        const now = new Date();
        const expiry = new Date(this.expirationDate);
        const diffTime = expiry - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    /**
     * Calculate freshness percentage based on production and expiration dates
     */
    calculateFreshness() {
        if (!this.productionDate || !this.expirationDate) {
            return this.freshnessScore;
        }

        const now = new Date();
        const production = new Date(this.productionDate);
        const expiration = new Date(this.expirationDate);

        const totalShelfLife = expiration - production;
        const timeElapsed = now - production;
        
        if (timeElapsed < 0) return 100; // Not yet produced
        if (timeElapsed > totalShelfLife) return 0; // Expired

        const freshness = Math.max(0, Math.min(100, 
            100 - (timeElapsed / totalShelfLife * 100)
        ));

        return Math.round(freshness);
    }

    /**
     * Check if product is expired
     */
    isExpired() {
        const daysRemaining = this.getDaysRemaining();
        return daysRemaining !== null && daysRemaining <= 0;
    }

    /**
     * Check if product is expiring soon (within threshold days)
     */
    isExpiringSoon(thresholdDays = 2) {
        const daysRemaining = this.getDaysRemaining();
        return daysRemaining !== null && daysRemaining > 0 && daysRemaining <= thresholdDays;
    }

    /**
     * Get risk level based on freshness and expiration
     */
    getRiskLevel() {
        if (this.isExpired()) return 'critical';
        if (this.isExpiringSoon(1)) return 'high';
        if (this.isExpiringSoon(3)) return 'medium';
        return 'low';
    }

    /**
     * Convert to JSON
     */
    toJSON() {
        return {
            id: this.id,
            batchNumber: this.batchNumber,
            productName: this.productName,
            sku: this.sku,
            category: this.category,
            weight: this.weight,
            quantity: this.quantity,
            expirationDate: this.expirationDate,
            productionDate: this.productionDate,
            location: this.location,
            flightNumber: this.flightNumber,
            flightDate: this.flightDate,
            freshnessScore: this.calculateFreshness(),
            temperature: this.temperature,
            qrCode: this.qrCode,
            daysRemaining: this.getDaysRemaining(),
            riskLevel: this.getRiskLevel(),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}

/**
 * Create product from QR data
 */
export function createProductFromQR(qrData) {
    return new Product({
        id: qrData.id || qrData.batchNumber,
        batchNumber: qrData.batchNumber || qrData.batch,
        productName: qrData.productName || qrData.name,
        sku: qrData.sku,
        category: qrData.category,
        weight: parseFloat(qrData.weight) || 0,
        quantity: parseInt(qrData.quantity) || 0,
        expirationDate: qrData.expirationDate || qrData.expiry,
        productionDate: qrData.productionDate || qrData.production,
        location: qrData.location,
        flightNumber: qrData.flightNumber || qrData.flight,
        flightDate: qrData.flightDate,
        temperature: parseFloat(qrData.temperature),
        qrCode: qrData.code || qrData.qrCode,
    });
}
