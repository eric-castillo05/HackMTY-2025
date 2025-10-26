// Configuración del backend - Cambiar según tu entorno
// Para iOS Simulator: 'http://localhost:5001'
// Para Android Emulator: 'http://10.0.2.2:5001'
// Para dispositivo físico: 'http://[TU_IP_LOCAL]:5001'
const API_BASE_URL = 'http://localhost:5001/api';

export const PredictionService = {
  /**
   * Obtiene las predicciones de consumo de todos los productos
   */
  async getFreshnessPredictions() {
    try {
      const response = await fetch(`${API_BASE_URL}/predictions`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching predictions from backend:', error);
      console.log('Usando datos mock como fallback');
      
      // Fallback a datos mock si el backend no está disponible
      return {
        predictions: [
          {
            id: '1',
            productName: 'Pollo a la Naranja con Arroz',
            sku: 'MEAL-HOT-001',
            category: 'Platillo Principal Caliente',
            location: 'Galley A - Carrito 2',
            predictabilityScore: 88,
            daysRemaining: 6,
            expiryDate: '2025-10-31',
            confidence: 94,
            history: [],
            recommendations: [
              'Temperatura de almacenamiento óptima',
              'Listo para servicio en vuelos de largo alcance',
            ],
          },
        ],
        alerts: [
          {
            severity: 'warning',
            title: 'Backend No Disponible',
            message: 'Usando datos de ejemplo. Inicia el servidor Flask en puerto 5001',
          },
        ],
      };
    }
  },

  /**
   * Obtiene la predicción de un producto específico
   */
  async getPredictionById(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/predictions/${productId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching prediction:', error);
      throw error;
    }
  },

  /**
   * Obtiene métricas del modelo
   */
  async getModelMetrics() {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/metrics`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      return { MAE: 0, RMSE: 0, R2: 0 };
    }
  },
};
