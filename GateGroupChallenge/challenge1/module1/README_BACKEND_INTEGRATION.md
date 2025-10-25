# Integración Backend - Verificación de Productos

## Descripción
Esta integración conecta el módulo 1 (Scanner QR) con el backend Spring Boot para verificar si los productos están vigentes o expirados.

## Archivos Modificados

### 1. Nuevo Servicio Backend
**Archivo:** `challenge1/module1/services/backendService.js`

Este servicio maneja toda la comunicación con el backend Spring Boot:
- `verificarProducto(url)`: Verifica el estado de un producto usando el endpoint `/productos/verificar`
- `insertarProducto(producto)`: Inserta un nuevo producto en la base de datos
- `checkConnection()`: Verifica si el backend está disponible

### 2. Scanner Screen Actualizado
**Archivo:** `challenge1/module1/screens/ScannerScreen.js`

Cambios realizados:
- Importa `BackendService` para hacer llamadas al backend
- Agrega estado `backendVerification` para almacenar la respuesta del backend
- Actualiza `handleBarCodeScanned` para llamar al backend después de escanear
- Muestra indicador visual del estado del producto:
  - 🟢 **VIGENTE**: Producto apto para uso
  - 🟠 **VENCE HOY**: Requiere uso inmediato
  - 🔴 **EXPIRADO**: Producto vencido

## Configuración

### 1. Backend Spring Boot

Asegúrate de que tu backend esté corriendo en `http://localhost:8080`

Si usas una URL diferente, actualiza la constante en el archivo:
```javascript
// challenge1/module1/services/backendService.js
const API_BASE_URL = 'http://localhost:8080'; // Cambiar según tu configuración
```

### 2. Endpoint del Backend

El backend debe tener el siguiente endpoint funcionando:

**Endpoint:** `GET /productos/verificar?url={url}`

**Respuesta esperada:**
```json
{
  "product_name": "Nombre del Producto",
  "expiry_date": "2025-10-30",
  "quantity": 100,
  "url_image": "https://...",
  "status": "VIGENTE",
  "days_left": 5
}
```

**Estados posibles:**
- `VIGENTE`: Producto dentro de fecha de vencimiento
- `VENCE HOY`: Producto vence hoy
- `VENCIDO`: Producto expirado (incluye `days_overdue`)

### 3. Configuración para React Native

Si estás usando un emulador o dispositivo físico, es posible que necesites:

#### Para Android Emulator:
```javascript
const API_BASE_URL = 'http://10.0.2.2:8080';
```

#### Para iOS Simulator:
```javascript
const API_BASE_URL = 'http://localhost:8080';
```

#### Para Dispositivo Físico:
```javascript
const API_BASE_URL = 'http://<TU_IP_LOCAL>:8080';
// Ejemplo: 'http://192.168.1.100:8080'
```

### 4. Configurar CORS en el Backend

Asegúrate de que tu backend tenga CORS habilitado para aceptar peticiones desde tu app móvil:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*");
    }
}
```

## Flujo de Verificación

1. Usuario escanea código QR
2. App registra el escaneo localmente (Firebase/Mock)
3. **App llama al backend** con el código escaneado
4. Backend busca el producto en la base de datos
5. Backend calcula si está vigente o expirado
6. Backend retorna el estado
7. **App muestra el resultado visual** en pantalla

## Manejo de Errores

Si el backend no está disponible:
- La app continuará funcionando con datos locales
- `backendVerification` será `null`
- No se mostrará el indicador de verificación backend
- Los logs mostrarán: "Error verificando producto en backend"

## Testing

### 1. Probar con Backend Local

```bash
# Terminal 1: Iniciar el backend
cd /Users/diegogax10/Documents/Workspace/HackMTY-2025/BackendApp
./mvnw spring-boot:run

# Terminal 2: Iniciar el frontend
cd /Users/diegogax10/Documents/Workspace/HackMTY-2025/GateGroupChallenge
npm start
```

### 2. Probar Endpoint Manualmente

```bash
# Verificar que el backend responde
curl "http://localhost:8080/productos/verificar?url=TEST_QR_CODE"
```

### 3. Insertar Producto de Prueba

```bash
curl -X POST http://localhost:8080/productos/insertar \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "PROD-001",
    "product_name": "Producto de Prueba",
    "lotsName": "LOTE-001",
    "expiry_date": "2025-12-31T00:00:00.000Z",
    "quantity": 100,
    "urlImage": "TEST_QR_CODE",
    "status": "VIGENTE",
    "mlg": "MX"
  }'
```

## Próximos Pasos

- [ ] Implementar caché de verificaciones para reducir llamadas al backend
- [ ] Agregar sincronización automática de productos locales con backend
- [ ] Implementar notificaciones push cuando productos estén por vencer
- [ ] Agregar dashboard de estadísticas de productos escaneados
- [ ] Implementar modo offline con cola de sincronización

## Troubleshooting

### Error: Network request failed
**Problema:** El dispositivo no puede conectarse al backend

**Soluciones:**
1. Verifica que el backend esté corriendo
2. Usa la IP correcta según tu dispositivo (ver sección 3)
3. Verifica que tu dispositivo esté en la misma red WiFi

### Error: CORS policy
**Problema:** Backend rechaza peticiones

**Solución:** Configura CORS en el backend (ver sección 4)

### Producto no encontrado
**Problema:** Backend retorna `error: "Producto no encontrado"`

**Solución:** 
1. Verifica que el producto exista en la base de datos
2. Asegúrate de que el campo `urlImage` coincida con el QR escaneado

## Contacto

Para preguntas o issues relacionados con la integración, contacta al equipo de desarrollo.
