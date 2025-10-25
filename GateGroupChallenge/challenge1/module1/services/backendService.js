// challenge1/module1/services/backendService.js
const API_BASE_URL = 'http://10.22.65.20:8080';

export class BackendService {

    static async verificarProducto(qrData) {
        try {
            console.log('\n🔵 ===== BACKEND SERVICE DEBUG =====');
            console.log('🔵 [1] QR Data original:', qrData);

            // Extraer UUID del QR
            let uuidProduct = this.extractUuidFromQR(qrData);
            console.log('🔵 [2] UUID extraído:', uuidProduct);

            // Construir URL del API
            const apiUrl = `${API_BASE_URL}/productos/verificar?url=${encodeURIComponent(uuidProduct)}`;
            console.log('🔵 [3] URL del backend:', apiUrl);

            // Timeout controller
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);

            try {
                console.log('🔵 [4] Enviando petición al backend...');

                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                console.log('🔵 [5] Response status:', response.status);
                console.log('🔵 [6] Response OK:', response.ok);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ [ERROR] Response no OK:', errorText);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('🔵 [7] Data recibida del backend:');
                console.log(JSON.stringify(data, null, 2));

                // Verificar si hay error en la respuesta
                if (data.error) {
                    console.log('⚠️ [WARNING] Backend retornó error:', data.error);
                    return {
                        error: data.error,
                        vigente: false,
                        mensaje: 'Error: ' + data.error
                    };
                }

                // Procesar respuesta exitosa
                const result = {
                    ...data,
                    vigente: data.status === 'VIGENTE',
                    mensaje: this.getMensajeEstado(data),
                };

                console.log('✅ [8] Resultado procesado:');
                console.log(JSON.stringify(result, null, 2));
                console.log('🔵 ===== FIN BACKEND SERVICE DEBUG =====\n');

                return result;

            } catch (fetchError) {
                clearTimeout(timeoutId);

                if (fetchError.name === 'AbortError') {
                    console.error('❌ TIMEOUT: Request timeout después de 60 segundos');
                    console.error('Backend URL:', apiUrl);
                    console.error('Tip: Verifica que el backend esté corriendo en', API_BASE_URL);
                } else {
                    console.error('❌ FETCH ERROR:', fetchError.message);
                    console.error('Stack:', fetchError.stack);
                }

                return null;
            }

        } catch (error) {
            console.error('❌ ERROR GENERAL verificando producto:', error);
            console.error('Stack:', error.stack);
            return null;
        }
    }

    /**
     * Extrae el UUID limpio del QR code
     */
    static extractUuidFromQR(qrData) {
        console.log('🔧 Extrayendo UUID de:', qrData);

        let uuid = qrData;

        // Caso 1: URL de Firebase Storage
        if (qrData.includes('firebasestorage.googleapis.com')) {
            console.log('🔧 Detectado: Firebase Storage URL');

            // Patrón: /o/UUID.png o /o/UUID?
            const match = qrData.match(/\/o\/([a-f0-9-]+)(?:\.(png|jpg|jpeg))?(?:\?|$)/i);
            if (match && match[1]) {
                uuid = match[1];
                console.log('🔧 UUID extraído (patrón 1):', uuid);
            } else {
                // Patrón alternativo más flexible
                const match2 = qrData.match(/\/o\/([^\/\?]+)/i);
                if (match2 && match2[1]) {
                    uuid = match2[1].replace(/\.(png|jpg|jpeg)$/i, '');
                    console.log('🔧 UUID extraído (patrón 2):', uuid);
                }
            }
        }
        // Caso 2: URL con parámetro ?url=
        else if (qrData.includes('?url=') || qrData.includes('&url=')) {
            console.log('🔧 Detectado: URL con parámetro url');
            const urlParams = new URLSearchParams(qrData.split('?')[1]);
            uuid = urlParams.get('url') || qrData;
            console.log('🔧 UUID extraído de query param:', uuid);
        }
        // Caso 3: Solo UUID (posiblemente con extensión)
        else {
            console.log('🔧 Asumiendo UUID directo');
            uuid = qrData;
        }

        // Limpiar extensiones finales
        uuid = uuid.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');

        // Limpiar espacios
        uuid = uuid.trim();

        console.log('🔧 UUID final limpio:', uuid);
        return uuid;
    }

    static getMensajeEstado(data) {
        switch (data.status) {
            case 'VIGENTE':
                return `${data.days_left} día${data.days_left !== 1 ? 's' : ''} restante${data.days_left !== 1 ? 's' : ''}`;
            case 'VENCE HOY':
                return 'Vence hoy - Usar inmediatamente';
            case 'VENCIDO':
                return `Vencido hace ${data.days_overdue} día${data.days_overdue !== 1 ? 's' : ''}`;
            default:
                return data.status || 'Estado desconocido';
        }
    }

    static async insertarProducto(producto) {
        try {
            console.log('📤 Insertando producto:', producto);

            const response = await fetch(
                `${API_BASE_URL}/productos/insertar`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(producto),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error insertando:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Producto insertado:', data);
            return data;

        } catch (error) {
            console.error('❌ Error insertando producto:', error);
            throw error;
        }
    }

    static async checkConnection() {
        try {
            console.log('🔌 Verificando conexión con backend...');

            const response = await fetch(
                `${API_BASE_URL}/productos/verificar?url=test-connection`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const isConnected = response.ok || response.status === 404;
            console.log(isConnected ? '✅ Backend disponible' : '❌ Backend NO disponible');

            return isConnected;

        } catch (error) {
            console.error('❌ Backend no disponible:', error.message);
            return false;
        }
    }
}