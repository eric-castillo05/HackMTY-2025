// challenge1/module1/services/backendService.js
// Servicio para conectar con el backend Spring Boot

// TODO: Configurar la URL del backend según tu entorno
const API_BASE_URL = 'https://preformationary-catharine-mispacked.ngrok-free.dev/'; // Cambiar según tu configuración

/**
 * Service to interact with the Spring Boot backend
 */
export class BackendService {
    /**
     * Verifica si un producto está vigente o expirado usando el backend
     * @param {string} url - URL del producto (puede ser el QR code o batch number)
     * @returns {object} Respuesta procesada con estado del producto
     */
    static async verificarProducto(url) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/productos/verificar?url=${encodeURIComponent(url)}`,
                
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Procesar respuesta para incluir campo 'vigente'
            if (data.error) {
                return null;
            }

            return {
                ...data,
                vigente: data.status === 'VIGENTE',
                mensaje: this.getMensajeEstado(data),
            };
        } catch (error) {
            console.error('Error verificando producto en backend:', error);
            // Si el backend no está disponible, retornamos null
            return null;
        }
    }

    /**
     * Genera mensaje descriptivo según el estado del producto
     * @param {object} data - Datos del backend
     * @returns {string} Mensaje descriptivo
     */
    static getMensajeEstado(data) {
        switch (data.status) {
            case 'VIGENTE':
                return `${data.days_left} día${data.days_left !== 1 ? 's' : ''} restante${data.days_left !== 1 ? 's' : ''}`;
            case 'VENCE HOY':
                return 'Vence hoy - Usar inmediatamente';
            case 'VENCIDO':
                return `Vencido hace ${data.days_overdue} día${data.days_overdue !== 1 ? 's' : ''}`;
            default:
                return data.status;
        }
    }

    /**
     * Inserta un nuevo producto en el backend
     * @param {object} producto - Objeto con los datos del producto
     * @returns {object} Producto insertado
     */
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error insertando producto en backend:', error);
            throw error;
        }
    }

    /**
     * Verifica el estado de conexión con el backend
     * @returns {boolean} true si el backend está disponible
     */
    static async checkConnection() {
        try {
            const response = await fetch(`${API_BASE_URL}/productos/verificar?url=test`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.ok || response.status === 404; // 404 es válido, significa que el backend responde
        } catch (error) {
            console.error('Backend no disponible:', error);
            return false;
        }
    }
}
