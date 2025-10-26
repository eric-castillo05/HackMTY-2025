// challenge1/module1/services/backendService.js
const API_BASE_URL = 'https://preformationary-catharine-mispacked.ngrok-free.dev';

export class BackendService {

    static async verificarProducto(qrData) {
        try {
            // Extraer UUID del QR
            let uuidProduct = this.extractUuidFromQR(qrData);

            // Construir URL del API
            const apiUrl = `${API_BASE_URL}/productos/verificar?url=${encodeURIComponent(uuidProduct)}`;

            // Timeout controller
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);

            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    await response.text();
                    return null;
                }

                const data = await response.json();

                // Verificar si hay error en la respuesta
                if (data.error) {
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

                return result;

            } catch (fetchError) {
                clearTimeout(timeoutId);
                return null;
            }

        } catch (error) {
            return null;
        }
    }

    /**
     * Extrae el UUID limpio del QR code
     */
    static extractUuidFromQR(qrData) {
        let uuid = qrData;

        // Caso 0: JSON object from QRCodeGenerator
        try {
            const parsed = JSON.parse(qrData);
            if (parsed.id) {
                uuid = parsed.id;
                return uuid;
            }
        } catch (e) {
            // Not JSON, continue with other patterns
        }

        // Caso 1: URL de Firebase Storage
        if (qrData.includes('firebasestorage.googleapis.com')) {
            // Patrón: /o/UUID.png o /o/UUID?
            const match = qrData.match(/\/o\/([a-f0-9-]+)(?:\.(png|jpg|jpeg))?(?:\?|$)/i);
            if (match && match[1]) {
                uuid = match[1];
            } else {
                // Patrón alternativo más flexible
                const match2 = qrData.match(/\/o\/([^\/\?]+)/i);
                if (match2 && match2[1]) {
                    uuid = match2[1].replace(/\.(png|jpg|jpeg)$/i, '');
                }
            }
        }
        // Caso 2: URL con parámetro ?url=
        else if (qrData.includes('?url=') || qrData.includes('&url=')) {
            const urlParams = new URLSearchParams(qrData.split('?')[1]);
            uuid = urlParams.get('url') || qrData;
        }
        // Caso 3: Solo UUID (posiblemente con extensión)
        else {
            uuid = qrData;
        }

        // Limpiar extensiones finales
        uuid = uuid.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');

        // Limpiar espacios
        uuid = uuid.trim();

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
                await response.text();
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            throw error;
        }
    }

    static async checkConnection() {
        try {
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
            return isConnected;

        } catch (error) {
            return false;
        }
    }
}
