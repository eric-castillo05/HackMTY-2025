// TODO: Configurar la URL del backend
const API_BASE_URL = 'http://localhost:8080/api'; // Cambiar según tu configuración

export const PredictionService = {
  /**
   * Obtiene las predicciones de frescura de todos los productos
   */
  async getFreshnessPredictions() {
    try {
      // TODO: Implementar llamada real al backend
      // const response = await fetch(`${API_BASE_URL}/predictions`);
      // const data = await response.json();
      // return data;
      
      // Mock data para desarrollo
      return {
        predictions: [
          {
            id: '1',
            productName: 'Manzanas Gala',
            sku: 'FRUIT-001',
            category: 'Frutas',
            location: 'Pasillo 3, Estante A',
            freshnessScore: 85,
            daysRemaining: 7,
            expiryDate: '2025-11-01',
            confidence: 92,
            history: [],
            recommendations: [
              'Mantener refrigeración constante',
              'Producto en condiciones óptimas',
            ],
          },
          {
            id: '2',
            productName: 'Lechugas Romanas',
            sku: 'VEG-045',
            category: 'Verduras',
            location: 'Pasillo 2, Refrigerador B',
            freshnessScore: 55,
            daysRemaining: 3,
            expiryDate: '2025-10-28',
            confidence: 88,
            history: [],
            recommendations: [
              'Considerar promoción para acelerar venta',
              'Revisar temperatura de almacenamiento',
            ],
          },
          {
            id: '3',
            productName: 'Fresas Orgánicas',
            sku: 'FRUIT-012',
            category: 'Frutas',
            location: 'Pasillo 3, Refrigerador C',
            freshnessScore: 35,
            daysRemaining: 1,
            expiryDate: '2025-10-26',
            confidence: 95,
            history: [],
            recommendations: [
              'URGENTE: Aplicar descuento inmediato',
              'Reubicar a zona de productos próximos a vencer',
              'Considerar uso en preparaciones de cocina',
            ],
          },
        ],
        alerts: [
          {
            severity: 'critical',
            title: 'Producto Crítico',
            message: 'Fresas Orgánicas tienen menos de 2 días de vida útil',
          },
          {
            severity: 'warning',
            title: 'Atención Requerida',
            message: '5 productos requieren revisión en las próximas 24 horas',
          },
        ],
      };
    } catch (error) {
      console.error('Error fetching predictions:', error);
      throw error;
    }
  },

  /**
   * Obtiene la predicción de un producto específico
   */
  async getPredictionById(productId) {
    try {
      // TODO: Implementar llamada real al backend
      // const response = await fetch(`${API_BASE_URL}/predictions/${productId}`);
      // const data = await response.json();
      // return data;
      
      return null; // Implementar con datos reales
    } catch (error) {
      console.error('Error fetching prediction:', error);
      throw error;
    }
  },

  /**
   * Actualiza la predicción de un producto
   */
  async updatePrediction(productId, updates) {
    try {
      // TODO: Implementar llamada real al backend
      // const response = await fetch(`${API_BASE_URL}/predictions/${productId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updates),
      // });
      // const data = await response.json();
      // return data;
      
      return null; // Implementar con datos reales
    } catch (error) {
      console.error('Error updating prediction:', error);
      throw error;
    }
  },
};
