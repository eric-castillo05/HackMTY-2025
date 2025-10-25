# Módulo 2: Dashboard Predictivo de Frescura

Este módulo implementa un dashboard predictivo para monitorear y predecir la frescura de productos perecederos.

## 🏗️ Estructura del Proyecto

```
module2/
├── components/          # Componentes reutilizables
│   ├── AlertBanner.js      # Banner de alertas
│   ├── FreshnessChart.js   # Gráfica de tendencias (placeholder)
│   └── PredictionCard.js   # Tarjeta de producto
├── screens/            # Pantallas principales
│   ├── DashboardScreen.js        # Vista principal del dashboard
│   └── PredictionDetailsScreen.js # Vista de detalles del producto
├── services/           # Lógica de negocio y API
│   ├── freshnessService.js   # Cálculos y análisis de frescura
│   └── predictionService.js  # Comunicación con backend
├── navigation/         # Configuración de navegación
│   └── Module2Navigator.js
└── index.js           # Punto de entrada del módulo
```

## 🚀 Características Implementadas

### ✅ Pantallas
- **DashboardScreen**: Vista principal con:
  - Lista de productos monitoreados
  - Alertas de productos críticos
  - Gráfica de tendencias (placeholder)
  - Pull-to-refresh

- **PredictionDetailsScreen**: Vista detallada con:
  - Información completa del producto
  - Score de frescura visual
  - Historial de predicciones
  - Recomendaciones específicas

### ✅ Componentes
- **PredictionCard**: Tarjeta con información resumida del producto
- **AlertBanner**: Banner de alertas con diferentes niveles de severidad
- **FreshnessChart**: Placeholder para gráfica (requiere instalación de librería)

### ✅ Servicios
- **PredictionService**: Mock data y estructura para llamadas API
- **FreshnessService**: Utilidades para análisis de frescura

## 📦 Dependencias Necesarias

Las siguientes dependencias ya deberían estar instaladas (si usas React Navigation):
```bash
npm install @react-navigation/native @react-navigation/stack
```

### Opcional: Para gráficas
```bash
npm install react-native-chart-kit react-native-svg
```

## 🔧 Configuración

### 1. Backend API
Edita `services/predictionService.js` y actualiza la URL del backend:
```javascript
const API_BASE_URL = 'http://tu-backend-url/api';
```

### 2. Datos Mock
Actualmente usa datos de ejemplo. Descomenta las llamadas reales al API cuando el backend esté listo.

### 3. Gráficas (Opcional)
Si instalaste `react-native-chart-kit`, descomenta el código en `components/FreshnessChart.js`:
```javascript
import { LineChart } from 'react-native-chart-kit';
```

## 🎨 Esquema de Colores

- **Verde (#4CAF50)**: Frescura óptima (>80%)
- **Naranja (#FF9800)**: Atención requerida (50-80%)
- **Rojo (#F44336)**: Estado crítico (<50%)

## 📊 Estructura de Datos

### Prediction Object
```javascript
{
  id: string,
  productName: string,
  sku: string,
  category: string,
  location: string,
  freshnessScore: number,      // 0-100
  daysRemaining: number,
  expiryDate: string,          // ISO format
  confidence: number,          // 0-100
  history: array,
  recommendations: string[]
}
```

### Alert Object
```javascript
{
  severity: 'critical' | 'warning' | 'info',
  title: string,
  message: string
}
```

## 🔄 Integración con la App Principal

Para integrar este módulo en tu app principal:

```javascript
import { Module2Navigator } from './challenge1/module2';

// En tu navigator principal:
<Tab.Screen 
  name="Frescura" 
  component={Module2Navigator}
  options={{
    tabBarIcon: ({ color, size }) => (
      <Icon name="trending-up" size={size} color={color} />
    ),
  }}
/>
```

## ✅ TODO

- [ ] Conectar con backend real
- [ ] Implementar gráfica de tendencias
- [ ] Agregar filtros y búsqueda
- [ ] Implementar notificaciones push
- [ ] Agregar exportación de reportes
- [ ] Implementar modo offline con cache

## 🔗 Backend Endpoints Esperados

```
GET    /api/predictions              # Lista todas las predicciones
GET    /api/predictions/:id          # Obtiene predicción específica
PUT    /api/predictions/:id          # Actualiza predicción
POST   /api/predictions/refresh      # Refresca todas las predicciones
```

## 📝 Notas

- El servicio actualmente usa datos mock para facilitar el desarrollo del frontend
- Las gráficas son placeholders que deben implementarse según preferencia
- Los colores y estilos pueden ajustarse según el diseño final
- Considera agregar loading states y error handling según necesidades
