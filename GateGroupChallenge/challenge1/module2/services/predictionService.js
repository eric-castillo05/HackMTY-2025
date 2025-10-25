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
      
      // Mock data para desarrollo - Comida de avión
      return {
        predictions: [
          {
            id: '1',
            productName: 'Pollo a la Naranja con Arroz',
            sku: 'MEAL-HOT-001',
            category: 'Platillo Principal Caliente',
            location: 'Galley A - Carrito 2',
            freshnessScore: 88,
            daysRemaining: 6,
            expiryDate: '2025-10-31',
            confidence: 94,
            history: [],
            recommendations: [
              'Temperatura de almacenamiento óptima',
              'Listo para servicio en vuelos de largo alcance',
              'Mantener cadena de frío hasta recalentamiento',
            ],
          },
          {
            id: '2',
            productName: 'Ensalada César con Pollo',
            sku: 'MEAL-COLD-015',
            category: 'Platillo Frío',
            location: 'Galley B - Refrigerador 1',
            freshnessScore: 62,
            daysRemaining: 3,
            expiryDate: '2025-10-28',
            confidence: 89,
            history: [],
            recommendations: [
              'Usar en vuelos de corta distancia',
              'Revisar frescura de vegetales antes del servicio',
              'Considerar rotación prioritaria',
            ],
          },
          {
            id: '3',
            productName: 'Pasta Alfredo con Camarones',
            sku: 'MEAL-HOT-008',
            category: 'Platillo Principal Caliente',
            location: 'Galley A - Carrito 5',
            freshnessScore: 42,
            daysRemaining: 2,
            expiryDate: '2025-10-27',
            confidence: 91,
            history: [],
            recommendations: [
              'ATENCIÓN: Usar en próximo servicio',
              'Verificar temperatura de almacenamiento',
              'No apto para vuelos largos',
            ],
          },
          {
            id: '4',
            productName: 'Sándwich de Pavo y Queso',
            sku: 'MEAL-COLD-023',
            category: 'Snack Frío',
            location: 'Galley C - Refrigerador 3',
            freshnessScore: 91,
            daysRemaining: 5,
            expiryDate: '2025-10-30',
            confidence: 96,
            history: [],
            recommendations: [
              'Producto en excelentes condiciones',
              'Ideal para todos los vuelos',
            ],
          },
          {
            id: '5',
            productName: 'Fruta Fresca Mix',
            sku: 'SNACK-FRUIT-005',
            category: 'Snack Saludable',
            location: 'Galley B - Refrigerador 2',
            freshnessScore: 28,
            daysRemaining: 1,
            expiryDate: '2025-10-26',
            confidence: 97,
            history: [],
            recommendations: [
              'URGENTE: Servir de inmediato',
              'No almacenar para próximos vuelos',
              'Considerar descarte si no se utiliza hoy',
            ],
          },
        ],
        alerts: [
          {
            severity: 'critical',
            title: 'Alimento Crítico',
            message: 'Fruta Fresca Mix debe servirse en las próximas 24 horas',
          },
          {
            severity: 'warning',
            title: 'Atención Requerida',
            message: '3 platillos requieren rotación prioritaria en próximos vuelos',
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
