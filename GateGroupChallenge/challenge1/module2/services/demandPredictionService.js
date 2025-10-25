// challenge1/module2/services/demandPredictionService.js

/**
 * Time series demand prediction service for airplane meals
 * Predicts demand based on flight date, menu rotation, and historical usage
 */
export class DemandPredictionService {
    /**
     * Predict demand for a specific product
     * @param {object} params - { productId, flightDate, menuRotation, historicalData }
     * @returns {object} Prediction with confidence interval
     */
    static predictDemand(params) {
        const {
            productId,
            productCategory,
            flightDate,
            flightClass = 'economy', // economy, business, first
            menuRotation,
            historicalData = [],
            passengerCount = 180,
            flightDuration = 3, // hours
        } = params;

        // Calculate base demand using historical average
        const baselineDemand = this.calculateBaseline(historicalData, productCategory);
        
        // Apply seasonal adjustments
        const seasonalFactor = this.getSeasonalFactor(flightDate);
        
        // Apply menu rotation factor
        const rotationFactor = this.getMenuRotationFactor(menuRotation);
        
        // Apply flight characteristics factor
        const flightFactor = this.getFlightFactor(flightClass, flightDuration);
        
        // Calculate passenger demand rate
        const demandRate = this.getDemandRate(productCategory, flightClass);
        
        // Predicted demand
        const predictedDemand = Math.round(
            baselineDemand * seasonalFactor * rotationFactor * flightFactor * demandRate * passengerCount
        );
        
        // Calculate confidence interval
        const confidence = this.calculateConfidence(historicalData);
        const margin = Math.ceil(predictedDemand * (1 - confidence / 100));
        
        return {
            productId,
            predictedDemand,
            confidence,
            lowerBound: Math.max(0, predictedDemand - margin),
            upperBound: predictedDemand + margin,
            factors: {
                baseline: baselineDemand,
                seasonal: seasonalFactor,
                rotation: rotationFactor,
                flight: flightFactor,
                demandRate,
            },
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Calculate baseline from historical data
     */
    static calculateBaseline(historicalData, category) {
        if (!historicalData || historicalData.length === 0) {
            // Default baseline by category
            const defaults = {
                'Hot Meal': 0.75,
                'Cold Meal': 0.60,
                'Snack': 0.45,
                'Beverage': 0.85,
                'Dessert': 0.40,
            };
            return defaults[category] || 0.50;
        }

        // Calculate weighted average (more recent = higher weight)
        let weightedSum = 0;
        let weightSum = 0;
        
        historicalData.forEach((record, index) => {
            const weight = index + 1; // Linear weighting
            weightedSum += record.consumptionRate * weight;
            weightSum += weight;
        });

        return weightSum > 0 ? weightedSum / weightSum : 0.50;
    }

    /**
     * Get seasonal adjustment factor
     */
    static getSeasonalFactor(flightDate) {
        const date = new Date(flightDate);
        const month = date.getMonth(); // 0-11
        const dayOfWeek = date.getDay(); // 0-6
        
        // Monthly seasonality (holiday seasons)
        const monthlyFactors = {
            0: 1.15,  // January (New Year)
            1: 1.05,  // February
            2: 1.10,  // March (Spring Break)
            3: 1.08,  // April
            4: 1.05,  // May
            5: 1.20,  // June (Summer start)
            6: 1.25,  // July (Peak summer)
            7: 1.22,  // August (Summer)
            8: 1.05,  // September
            9: 1.08,  // October
            10: 1.15, // November (Thanksgiving)
            11: 1.30, // December (Holidays)
        };
        
        // Weekly seasonality
        const weeklyFactors = {
            0: 1.05, // Sunday
            1: 0.95, // Monday
            2: 0.92, // Tuesday
            3: 0.90, // Wednesday
            4: 1.00, // Thursday
            5: 1.15, // Friday
            6: 1.10, // Saturday
        };
        
        return (monthlyFactors[month] || 1.0) * (weeklyFactors[dayOfWeek] || 1.0) / 1.1;
    }

    /**
     * Get menu rotation factor
     */
    static getMenuRotationFactor(menuRotation) {
        if (!menuRotation) return 1.0;

        const { daysInRotation, daysSinceLastServed, popularity } = menuRotation;
        
        // Freshness factor (people want variety)
        const freshnessFactor = daysInRotation > 0 
            ? Math.min(1.5, 1 + (daysSinceLastServed / daysInRotation))
            : 1.0;
        
        // Popularity factor
        const popularityFactor = popularity || 1.0;
        
        return (freshnessFactor + popularityFactor) / 2;
    }

    /**
     * Get flight characteristics factor
     */
    static getFlightFactor(flightClass, duration) {
        // Class multipliers
        const classFactors = {
            'economy': 1.0,
            'premium-economy': 1.15,
            'business': 1.35,
            'first': 1.50,
        };
        
        // Duration multipliers (longer flights = more meals)
        let durationFactor = 1.0;
        if (duration > 6) durationFactor = 1.8;
        else if (duration > 4) durationFactor = 1.4;
        else if (duration > 2) durationFactor = 1.1;
        
        return (classFactors[flightClass] || 1.0) * durationFactor;
    }

    /**
     * Get demand rate by category
     */
    static getDemandRate(category, flightClass) {
        const rates = {
            'Hot Meal': { economy: 0.72, business: 0.95 },
            'Cold Meal': { economy: 0.58, business: 0.85 },
            'Snack': { economy: 0.42, business: 0.65 },
            'Beverage': { economy: 0.88, business: 0.98 },
            'Dessert': { economy: 0.38, business: 0.75 },
        };
        
        const categoryRates = rates[category] || { economy: 0.50, business: 0.70 };
        const classKey = flightClass.includes('business') || flightClass === 'first' 
            ? 'business' 
            : 'economy';
        
        return categoryRates[classKey];
    }

    /**
     * Calculate confidence level
     */
    static calculateConfidence(historicalData) {
        if (!historicalData || historicalData.length === 0) {
            return 75; // Default confidence with no data
        }
        
        // More data = higher confidence
        const dataConfidence = Math.min(95, 70 + historicalData.length * 2);
        
        // Calculate variance
        const values = historicalData.map(d => d.consumptionRate);
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        // Lower variance = higher confidence
        const varianceConfidence = Math.max(70, 98 - (stdDev * 100));
        
        return Math.round((dataConfidence + varianceConfidence) / 2);
    }

    /**
     * Batch predict for multiple products
     */
    static batchPredict(productsList, commonParams) {
        return productsList.map(product => {
            return this.predictDemand({
                productId: product.id,
                productCategory: product.category,
                ...commonParams,
                historicalData: product.historicalData || [],
            });
        });
    }

    /**
     * Get optimal inventory level
     * Calculates recommended stock level with 2% error margin
     */
    static getOptimalInventory(prediction, safetyStockDays = 2) {
        const { predictedDemand, upperBound } = prediction;
        
        // Use upper bound for safety
        const dailyDemand = upperBound;
        
        // Add safety stock (2% error margin requirement)
        const errorMargin = 0.02;
        const safetyStock = Math.ceil(dailyDemand * safetyStockDays * (1 + errorMargin));
        
        return {
            recommended: dailyDemand + safetyStock,
            minimum: predictedDemand,
            maximum: upperBound + safetyStock,
            safetyStock,
        };
    }

    /**
     * Analyze historical patterns
     */
    static analyzePatterns(historicalData) {
        if (!historicalData || historicalData.length < 3) {
            return { trend: 'insufficient_data', patterns: [] };
        }

        const values = historicalData.map(d => d.consumptionRate);
        
        // Detect trend
        let trend = 'stable';
        const recent = values.slice(-3);
        const older = values.slice(0, -3);
        
        if (older.length > 0) {
            const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
            const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
            
            if (recentAvg > olderAvg * 1.1) trend = 'increasing';
            else if (recentAvg < olderAvg * 0.9) trend = 'decreasing';
        }
        
        // Detect patterns
        const patterns = [];
        const variance = this.calculateVariance(values);
        
        if (variance < 0.05) patterns.push('consistent');
        if (variance > 0.20) patterns.push('volatile');
        
        return { trend, patterns, variance };
    }

    /**
     * Calculate variance helper
     */
    static calculateVariance(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return variance;
    }
}
