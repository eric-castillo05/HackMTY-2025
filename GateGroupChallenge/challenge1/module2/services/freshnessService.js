export const FreshnessService = {
  /**
   * Calcula el score de frescura basado en múltiples factores
   */
  calculateFreshnessScore(product) {
    // Implementar lógica de cálculo
    // Factores: días restantes, temperatura, humedad, etc.
    return 0;
  },

  /**
   * Determina si un producto necesita atención inmediata
   */
  needsAttention(prediction) {
    return prediction.freshnessScore < 50 || prediction.daysRemaining <= 2;
  },

  /**
   * Genera recomendaciones basadas en el estado del producto
   */
  generateRecommendations(prediction) {
    const recommendations = [];
    
    if (prediction.freshnessScore < 40) {
      recommendations.push('URGENTE: Aplicar descuento inmediato');
      recommendations.push('Considerar donación o descarte apropiado');
    } else if (prediction.freshnessScore < 60) {
      recommendations.push('Considerar promoción para acelerar venta');
      recommendations.push('Revisar condiciones de almacenamiento');
    } else {
      recommendations.push('Producto en condiciones óptimas');
      recommendations.push('Mantener monitoreo regular');
    }
    
    return recommendations;
  },

  /**
   * Clasifica productos por nivel de urgencia
   */
  classifyByUrgency(predictions) {
    return {
      critical: predictions.filter(p => p.freshnessScore < 40),
      warning: predictions.filter(p => p.freshnessScore >= 40 && p.freshnessScore < 70),
      good: predictions.filter(p => p.freshnessScore >= 70),
    };
  },

  /**
   * Calcula estadísticas del inventario
   */
  calculateInventoryStats(predictions) {
    const total = predictions.length;
    const critical = predictions.filter(p => p.freshnessScore < 40).length;
    const warning = predictions.filter(p => p.freshnessScore >= 40 && p.freshnessScore < 70).length;
    const good = predictions.filter(p => p.freshnessScore >= 70).length;
    
    const averageScore = predictions.reduce((sum, p) => sum + p.freshnessScore, 0) / total;
    
    return {
      total,
      critical,
      warning,
      good,
      averageScore: Math.round(averageScore),
      criticalPercentage: Math.round((critical / total) * 100),
    };
  },
};
