// challenge1/module1/services/mockProductData.js

/**
 * Generate mock product data for QR codes
 * This simulates what would come from Firebase/backend
 */
export function generateMockProductData(qrCode) {
    // Simulate different products based on QR code pattern
    const products = [
        {
            code: 'MEAL-HOT-001-BATCH-2025-10',
            batchNumber: 'BATCH-2025-10-001',
            productName: 'Pollo a la Naranja con Arroz',
            sku: 'MEAL-HOT-001',
            category: 'Platillo Principal Caliente',
            weight: 450,
            quantity: 180,
            expirationDate: '2025-10-31T23:59:59Z',
            productionDate: '2025-10-24T08:00:00Z',
            location: 'Galley A - Carrito 2',
            flightNumber: 'AA1234',
            flightDate: '2025-10-26T14:30:00Z',
            temperature: 4.5,
        },
        {
            code: 'MEAL-COLD-015-BATCH-2025-10',
            batchNumber: 'BATCH-2025-10-015',
            productName: 'Ensalada César con Pollo',
            sku: 'MEAL-COLD-015',
            category: 'Platillo Frío',
            weight: 320,
            quantity: 150,
            expirationDate: '2025-10-28T23:59:59Z',
            productionDate: '2025-10-25T06:00:00Z',
            location: 'Galley B - Refrigerador 1',
            flightNumber: 'AA1234',
            flightDate: '2025-10-26T14:30:00Z',
            temperature: 3.2,
        },
        {
            code: 'MEAL-HOT-008-BATCH-2025-10',
            batchNumber: 'BATCH-2025-10-008',
            productName: 'Pasta Alfredo con Camarones',
            sku: 'MEAL-HOT-008',
            category: 'Platillo Principal Caliente',
            weight: 480,
            quantity: 120,
            expirationDate: '2025-10-27T23:59:59Z',
            productionDate: '2025-10-24T10:00:00Z',
            location: 'Galley A - Carrito 5',
            flightNumber: 'AA5678',
            flightDate: '2025-10-27T09:15:00Z',
            temperature: 5.1,
        },
        {
            code: 'SNACK-COLD-023-BATCH-2025-10',
            batchNumber: 'BATCH-2025-10-023',
            productName: 'Sándwich de Pavo y Queso',
            sku: 'MEAL-COLD-023',
            category: 'Snack Frío',
            weight: 280,
            quantity: 200,
            expirationDate: '2025-10-30T23:59:59Z',
            productionDate: '2025-10-25T05:00:00Z',
            location: 'Galley C - Refrigerador 3',
            flightNumber: 'AA9012',
            flightDate: '2025-10-26T18:45:00Z',
            temperature: 4.0,
        },
        {
            code: 'SNACK-FRUIT-005-BATCH-2025-10',
            batchNumber: 'BATCH-2025-10-005',
            productName: 'Fruta Fresca Mix',
            sku: 'SNACK-FRUIT-005',
            category: 'Snack Saludable',
            weight: 200,
            quantity: 90,
            expirationDate: '2025-10-26T23:59:59Z',
            productionDate: '2025-10-25T12:00:00Z',
            location: 'Galley B - Refrigerador 2',
            flightNumber: 'AA1234',
            flightDate: '2025-10-26T14:30:00Z',
            temperature: 2.8,
        },
        {
            code: 'BEVERAGE-HOT-012-BATCH-2025-10',
            batchNumber: 'BATCH-2025-10-012',
            productName: 'Café Premium Colombiano',
            sku: 'BEVERAGE-HOT-012',
            category: 'Bebida Caliente',
            weight: 15,
            quantity: 250,
            expirationDate: '2025-11-15T23:59:59Z',
            productionDate: '2025-10-20T00:00:00Z',
            location: 'Galley A - Dispensador 1',
            flightNumber: null,
            flightDate: null,
            temperature: 22.0,
        },
        {
            code: 'DESSERT-001-BATCH-2025-10',
            batchNumber: 'BATCH-2025-10-D01',
            productName: 'Tarta de Manzana Individual',
            sku: 'DESSERT-001',
            category: 'Postre',
            weight: 120,
            quantity: 160,
            expirationDate: '2025-10-29T23:59:59Z',
            productionDate: '2025-10-24T16:00:00Z',
            location: 'Galley C - Refrigerador 4',
            flightNumber: 'AA5678',
            flightDate: '2025-10-27T09:15:00Z',
            temperature: 4.2,
        },
    ];

    // Try to find exact match
    let product = products.find(p => p.code === qrCode);
    
    // If not found, generate a generic one
    if (!product) {
        product = {
            code: qrCode,
            batchNumber: `BATCH-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 1000)}`,
            productName: 'Producto Genérico',
            sku: qrCode.split('-')[0] || 'UNKNOWN',
            category: 'Sin Categoría',
            weight: 300,
            quantity: 100,
            expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            productionDate: new Date().toISOString(),
            location: 'Almacén General',
            flightNumber: null,
            flightDate: null,
            temperature: 4.0,
        };
    }

    return product;
}

/**
 * Get all mock products
 */
export function getAllMockProducts() {
    return [
        'MEAL-HOT-001-BATCH-2025-10',
        'MEAL-COLD-015-BATCH-2025-10',
        'MEAL-HOT-008-BATCH-2025-10',
        'SNACK-COLD-023-BATCH-2025-10',
        'SNACK-FRUIT-005-BATCH-2025-10',
        'BEVERAGE-HOT-012-BATCH-2025-10',
        'DESSERT-001-BATCH-2025-10',
    ].map(code => generateMockProductData(code));
}
