// challenge2/module3/services/apiService.js
import axios from 'axios';

// URL de tu backend - cambiar según tu configuración
const API_BASE_URL = 'https://preformationary-catharine-mispacked.ngrok-free.dev';

// Configuración de axios
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Servicio API para comunicación con el backend
 */
export class ApiService {
    /**
     * Registrar un nuevo producto en la base de datos
     * @param {Object} productData - Datos del producto
     * @returns {Promise<Object>} - Respuesta del servidor
     */
    static async registerProduct(productData) {
        try {
            // Generar UUID v4
            const generateUUID = () => {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    const r = Math.random() * 16 | 0;
                    const v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };

            const payload = {
                uuidProduct: generateUUID(),
                product_id: productData.product_id,
                product_name: productData.product_name,
                lotsName: productData.lotsName,
                expiry_date: productData.expiry_date,
                quantity: productData.quantity,
                urlImage: '', // Se generará automáticamente en el backend
                status: productData.status,
                mlg: productData.mlg,
            };

            const response = await axiosInstance.post('/productos/insertar', payload);
            
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Error al registrar producto',
                statusCode: error.response?.status,
            };
        }
    }

    /**
     * Verificar un producto por su ID
     * @param {string} productId - ID del producto
     * @returns {Promise<Object>} - Información del producto
     */
    static async verifyProduct(productId) {
        try {
            const response = await axiosInstance.get(`/productos/verificar?url=${encodeURIComponent(productId)}`);
            
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Error al verificar producto',
                statusCode: error.response?.status,
            };
        }
    }

    /**
     * Obtener todos los productos
     * @returns {Promise<Object>} - Lista de productos
     */
    static async getAllProducts() {
        try {
            const response = await axiosInstance.get('/productos');
            
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Error al obtener productos',
                statusCode: error.response?.status,
            };
        }
    }

    /**
     * Actualizar un producto existente
     * @param {string} productId - ID del producto
     * @param {Object} productData - Datos actualizados
     * @returns {Promise<Object>} - Respuesta del servidor
     */
    static async updateProduct(productId, productData) {
        try {
            const response = await axiosInstance.put(`/productos/${productId}`, productData);
            
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Error al actualizar producto',
                statusCode: error.response?.status,
            };
        }
    }

    /**
     * Eliminar un producto usando uuidProduct
     * @param {string} uuidProduct - UUID del producto
     * @returns {Promise<Object>} - Respuesta del servidor
     */
    static async deleteProduct(uuidProduct) {
        try {
            const response = await axiosInstance.delete(`/productos?url=${encodeURIComponent(uuidProduct)}`);
            
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Error al eliminar producto',
                statusCode: error.response?.status,
            };
        }
    }


    /**
     * Verificar conexión con el backend
     * @returns {Promise<boolean>} - Estado de la conexión
     */
    static async checkConnection() {
        try {
            const response = await axiosInstance.get('/productos/verificar?url=test-connection', {
                timeout: 5000,
            });
            return response.status === 200 || response.status === 404;
        } catch (error) {
            return false;
        }
    }
}
