# Sistema de Gestión de Expiración de Alimentos de Avión

## Descripción General

Sistema completo de gestión de inventario y predicción de demanda para alimentos de avión (catering). El sistema integra escaneo QR, monitoreo de frescura en tiempo real, y predicción de demanda basada en series de tiempo.

## Componentes del Sistema

### 1. Módulo 1: Lector QR
**Ubicación**: `challenge1/module1/`

**Funcionalidades**:
- Escaneo de códigos QR con cámara del dispositivo
- Lectura de información del producto:
  - Número de lote
  - Nombre del producto
  - Peso (gramos)
  - Cantidad (unidades)
  - Fecha de expiración
  - Fecha de producción
  - Ubicación de almacenamiento
  - Número de vuelo
  - Temperatura
- Almacenamiento automático de productos escaneados en inventario local
- Contador de escaneos por código QR
- Historial de escaneos

**Archivos clave**:
- `screens/ScannerScreen.js` - Interfaz de escaneo QR
- `services/qrCounterService.js` - Servicio de conteo de escaneos
- `services/firebaseService.js` - Verificación de códigos (mock data temporal)
- `services/mockProductData.js` - Datos de prueba de productos

### 2. Módulo 2: Dashboard y Predicciones
**Ubicación**: `challenge1/module2/`

**Funcionalidades**:
- Dashboard en tiempo real con estadísticas
- Agrupación dinámica de productos por:
  - **Fecha de expiración** (crítico, alto riesgo, medio riesgo, bajo riesgo)
  - **Categoría** (platillos calientes, fríos, snacks, bebidas, postres)
  - **Ubicación** (Galley A/B/C, Refrigeradores, Carritos)
  - **Vuelo** (número de vuelo asignado)
- Alertas automáticas para productos críticos
- Cálculo de frescura en tiempo real
- Predicción de demanda usando series de tiempo
- Visualización de detalles de producto y predicciones

**Archivos clave**:
- `screens/DashboardScreen.js` - Dashboard principal con agrupaciones
- `screens/PredictionDetailsScreen.js` - Detalles de producto con predicción de demanda
- `services/demandPredictionService.js` - Modelo predictivo de demanda
- `services/predictionService.js` - Servicio de predicciones de frescura
- `components/PredictionCard.js` - Tarjeta de producto
- `components/AlertBanner.js` - Alertas del sistema

### 3. Modelos y Servicios Compartidos
**Ubicación**: `challenge1/shared/`

**Componentes**:
- **ProductModel.js** - Modelo de datos de producto con lógica de negocio:
  - Cálculo de días restantes hasta expiración
  - Cálculo de frescura basado en fecha de producción y expiración
  - Determinación de nivel de riesgo
  - Validación de producto expirado
  
- **productService.js** - Gestión de inventario:
  - CRUD de productos
  - Agrupación por diferentes criterios
  - Cálculo de estadísticas
  - Persistencia local con AsyncStorage

## Modelo Predictivo de Demanda

### Características del Modelo
**Ubicación**: `challenge1/module2/services/demandPredictionService.js`

El modelo utiliza análisis de series de tiempo con múltiples factores:

#### Factores de Predicción:
1. **Baseline (Línea Base)**:
   - Promedio ponderado de datos históricos
   - Tasas por defecto por categoría si no hay historial

2. **Factor Estacional**:
   - Variación mensual (temporada alta/baja)
   - Variación semanal (fin de semana vs días laborables)
   - Ajuste por festividades

3. **Factor de Rotación de Menú**:
   - Días desde último servicio
   - Popularidad del platillo
   - Variedad en el menú

4. **Factor de Vuelo**:
   - Clase de vuelo (economy, business, first)
   - Duración del vuelo
   - Número de pasajeros

5. **Tasa de Demanda**:
   - Tasas específicas por categoría y clase
   - Basadas en patrones de consumo reales

#### Precisión del Modelo:
- **Margen de error objetivo**: 2%
- **Nivel de confianza**: 75-98% (según disponibilidad de datos históricos)
- **Intervalos de confianza**: Cálculo de límites superior e inferior
- **Stock de seguridad**: Incluye margen del 2% para cumplir requisitos

#### Salida del Modelo:
```javascript
{
  productId: string,
  predictedDemand: number,        // Demanda predicha
  confidence: number,              // Nivel de confianza (%)
  lowerBound: number,              // Límite inferior
  upperBound: number,              // Límite superior
  factors: {
    baseline: number,
    seasonal: number,
    rotation: number,
    flight: number,
    demandRate: number
  },
  timestamp: string
}
```

## Estructura de Datos del Producto

```javascript
{
  id: string,                      // ID único
  batchNumber: string,             // Número de lote
  productName: string,             // Nombre del producto
  sku: string,                     // SKU
  category: string,                // Categoría
  weight: number,                  // Peso en gramos
  quantity: number,                // Cantidad en unidades
  expirationDate: string,          // Fecha de expiración (ISO)
  productionDate: string,          // Fecha de producción (ISO)
  location: string,                // Ubicación de almacenamiento
  flightNumber: string,            // Número de vuelo (opcional)
  flightDate: string,              // Fecha de vuelo (ISO, opcional)
  freshnessScore: number,          // Score de frescura (0-100)
  temperature: number,             // Temperatura en °C
  qrCode: string,                  // Código QR
  daysRemaining: number,           // Días hasta expiración
  riskLevel: string,               // 'low', 'medium', 'high', 'critical'
  createdAt: string,               // Timestamp de creación
  updatedAt: string                // Timestamp de actualización
}
```

## Códigos QR de Prueba

Para probar el sistema, usa estos códigos QR (disponibles en `mockProductData.js`):

1. `MEAL-HOT-001-BATCH-2025-10` - Pollo a la Naranja con Arroz
2. `MEAL-COLD-015-BATCH-2025-10` - Ensalada César con Pollo
3. `MEAL-HOT-008-BATCH-2025-10` - Pasta Alfredo con Camarones
4. `SNACK-COLD-023-BATCH-2025-10` - Sándwich de Pavo y Queso
5. `SNACK-FRUIT-005-BATCH-2025-10` - Fruta Fresca Mix
6. `BEVERAGE-HOT-012-BATCH-2025-10` - Café Premium Colombiano
7. `DESSERT-001-BATCH-2025-10` - Tarta de Manzana Individual

## Flujo de Trabajo

### Para Personal de Catering:

1. **Escaneo de Productos**:
   - Abrir Módulo 1 (QR Scanner)
   - Escanear código QR del producto
   - El sistema automáticamente guarda el producto en inventario
   - Verificar información mostrada en pantalla

2. **Monitoreo de Inventario**:
   - Abrir Módulo 2 (Dashboard)
   - Ver estadísticas generales (total, expirados, por vencer, frescos)
   - Revisar alertas críticas
   - Cambiar agrupación según necesidad

3. **Verificación de Producto**:
   - Tocar cualquier tarjeta de producto
   - Ver información detallada
   - Revisar predicción de demanda
   - Tomar decisiones basadas en datos

4. **Gestión de Alertas**:
   - Productos críticos (rojo): Acción inmediata requerida
   - Productos por vencer (naranja): Planificar rotación
   - Productos frescos (verde): Óptimos para servicio

## Niveles de Riesgo

- **Crítico (Critical)**: Producto expirado
- **Alto (High)**: Expira en 1 día o menos
- **Medio (Medium)**: Expira en 2-3 días
- **Bajo (Low)**: Más de 3 días hasta expiración

## Características Técnicas

### Almacenamiento Local
- Usa AsyncStorage de React Native
- Persistencia de datos entre sesiones
- No requiere conexión a internet para operación básica

### Integración con Firebase (Opcional)
- Soporte preparado para Firebase/Firestore
- Actualmente usa datos mock para desarrollo
- Fácil migración a backend real

### Predicción de Demanda
- Algoritmo de series de tiempo
- Factores múltiples ponderados
- Confianza estadística calculada
- Margen de error del 2%

## Instalación y Uso

### Prerrequisitos
```bash
npm install
```

### Ejecutar la Aplicación
```bash
npx expo start
```

### Navegar al Sistema
1. Abrir app en simulador/dispositivo
2. Acceder a "Module 1 - QR Scanner" desde el menú drawer
3. Acceder a "Module 2 - Dashboard" desde el menú drawer

## Próximas Mejoras

1. **Integración con Backend**:
   - Configurar Firebase/Firestore
   - API REST para sincronización
   - Autenticación de usuarios

2. **Modelo Predictivo Avanzado**:
   - Machine Learning con TensorFlow.js
   - Entrenamiento con datos históricos reales
   - Ajuste automático de parámetros

3. **Funcionalidades Adicionales**:
   - Generación de reportes PDF
   - Notificaciones push
   - Exportación de datos
   - Gestión de usuarios y roles

4. **Optimizaciones**:
   - Caché de predicciones
   - Sincronización en background
   - Modo offline completo

## Soporte

Para usuarios del sistema de catering:
- El sistema está diseñado para ser intuitivo
- Todas las acciones se confirman visualmente
- Los colores indican prioridad (rojo=urgente, naranja=atención, verde=ok)
- Escanear QR automáticamente agrega productos al inventario
