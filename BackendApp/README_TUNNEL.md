# Backend con Túnel Público

## Opciones de Túnel

Tienes dos opciones para exponer tu backend Docker públicamente:

### 1. ngrok (Recomendado para desarrollo)
-  Interfaz web con estadísticas
-  URLs más amigables
-  Requiere cuenta gratuita para sesiones largas
-  Límite de 40 conexiones/minuto en plan gratuito

### 2. Cloudflare Tunnel (Recomendado para producción)
-  Completamente gratis
-  Sin límites de conexiones
-  Más rápido y estable
-  URLs menos amigables

## Inicio Rápido

### Opción 1: Usar ngrok

```bash
# Dar permisos de ejecución
chmod +x start-with-ngrok.sh

# Ejecutar
./start-with-ngrok.sh
```

Cuando se ejecute, verás algo como:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:8080
```

**Tu URL pública será:** `https://abc123.ngrok-free.app`

#### Configurar ngrok (primera vez)

1. Crear cuenta en https://ngrok.com
2. Obtener tu authtoken en https://dashboard.ngrok.com/get-started/your-authtoken
3. Configurarlo:
   ```bash
   ngrok config add-authtoken TU_TOKEN_AQUI
   ```

### Opción 2: Usar Cloudflare Tunnel

```bash
# Dar permisos de ejecución
chmod +x start-with-cloudflare.sh

# Ejecutar
./start-with-cloudflare.sh
```

Cuando se ejecute, verás algo como:
```
Your quick tunnel is available at: https://abc-def-123.trycloudflare.com
```

**Tu URL pública será:** `https://abc-def-123.trycloudflare.com`

**Ventaja:** No requiere configuración previa, funciona inmediatamente.

## Actualizar el Frontend

Una vez que tengas tu URL pública, actualiza el frontend:

### En el archivo de configuración
```javascript
// challenge1/module1/services/backendService.js
const API_BASE_URL = 'https://TU-URL-PUBLICA-AQUI'; // Sin el puerto
```

Por ejemplo:
- ngrok: `https://abc123.ngrok-free.app`
- Cloudflare: `https://abc-def-123.trycloudflare.com`

## Probar el Túnel

Desde cualquier dispositivo con internet:

```bash
# Verificar que funciona
curl https://TU-URL-PUBLICA/productos/verificar?url=test
```

O abre en tu navegador:
```
https://TU-URL-PUBLICA/productos/verificar?url=test
```

## Comandos Útiles

### Ver logs del contenedor
```bash
docker-compose logs -f
```

### Detener el backend
```bash
docker-compose down
```

### Reiniciar el backend
```bash
docker-compose restart
```

### Ver contenedores corriendo
```bash
docker ps
```

### Acceder al contenedor
```bash
docker exec -it gate_group sh
```

## Solución de Problemas

### El túnel no se conecta
1. Verifica que Docker esté corriendo: `docker ps`
2. Verifica que el backend responda localmente: `curl http://localhost:8080`
3. Revisa los logs: `docker-compose logs`

### Error "address already in use"
```bash
# Detener todos los contenedores en el puerto 8080
docker ps | grep 8080
docker stop CONTAINER_ID
```

### El backend no responde
```bash
# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar
docker-compose restart
```

### Cloudflared: "Failed to create tunnel"
```bash
# Asegúrate de que el puerto 8080 esté libre
lsof -i :8080

# Mata el proceso si es necesario
kill -9 PID
```

### ngrok: "Your account is limited to 1 online ngrok agent session"
Ya tienes otra sesión activa. Opciones:
1. Cierra la otra sesión
2. Usa Cloudflare Tunnel en su lugar
3. Actualiza a ngrok Pro

## Configuración Avanzada

### ngrok con dominio personalizado (Pro)
```bash
ngrok http 8080 --domain=tu-dominio.ngrok-free.app
```

### Cloudflare con configuración persistente
Crea un archivo `cloudflared-config.yml`:
```yaml
tunnel: tu-tunnel-id
credentials-file: /path/to/credentials.json

ingress:
  - hostname: tu-dominio.com
    service: http://localhost:8080
  - service: http_status:404
```

Luego ejecuta:
```bash
cloudflared tunnel --config cloudflared-config.yml run
```

## Seguridad

⚠️ **IMPORTANTE:** Estos túneles exponen tu backend a internet. Considera:

1. **Autenticación:** Implementa tokens/API keys
2. **Rate limiting:** Limita peticiones por IP
3. **CORS:** Configura CORS correctamente
4. **HTTPS:** Los túneles ya proveen HTTPS automáticamente
5. **Monitoreo:** Revisa los logs regularmente

### Ejemplo de configuración CORS segura

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("https://tu-app-frontend.com") // Especifica tu dominio
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## URLs para Compartir

Una vez que tu túnel esté activo, comparte estas URLs:

### API Base
```
https://TU-URL-PUBLICA
```

### Verificar Producto
```
https://TU-URL-PUBLICA/productos/verificar?url=QR_CODE
```

### Insertar Producto
```
POST https://TU-URL-PUBLICA/productos/insertar
Content-Type: application/json
{...}
```

## Mantener el Túnel Activo

Los scripts mantienen el túnel abierto mientras estén corriendo. Para mantenerlo 24/7:

1. Usa un servidor en la nube (AWS, DigitalOcean, etc.)
2. O ejecuta como servicio del sistema (systemd en Linux)
3. O usa screen/tmux para mantener la sesión

### Con screen (mantener después de cerrar terminal)
```bash
# Instalar screen
brew install screen

# Crear sesión
screen -S backend-tunnel

# Ejecutar script
./start-with-cloudflare.sh

# Detach: Ctrl+A, luego D

# Reattach después
screen -r backend-tunnel
```

## Alternativas

Si ninguna opción funciona, considera:
- **localtunnel:** `npx localtunnel --port 8080`
- **serveo:** `ssh -R 80:localhost:8080 serveo.net`
- **Tailscale:** Para acceso privado entre dispositivos
