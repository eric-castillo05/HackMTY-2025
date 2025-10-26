// shared/services/errorHandler.js

/**
 * Servicio centralizado para el manejo de errores
 * Todos los errores se registran internamente sin mostrar notificaciones al usuario
 */
export class ErrorHandler {
    static logs = [];
    static maxLogs = 100;

    /**
     * Registra un error de manera silenciosa
     * @param {string} context - Contexto donde ocurrió el error
     * @param {Error|string} error - El error a registrar
     * @param {object} additionalInfo - Información adicional
     */
    static logError(context, error, additionalInfo = {}) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            context,
            message: error?.message || error || 'Unknown error',
            stack: error?.stack || null,
            additionalInfo,
        };

        // Mantener solo los últimos N logs
        if (this.logs.length >= this.maxLogs) {
            this.logs.shift();
        }

        this.logs.push(errorLog);

        // Solo log en desarrollo (opcional)
        if (__DEV__) {
            console.log(`[ErrorHandler] ${context}:`, error);
        }
    }

    /**
     * Registra una advertencia
     * @param {string} context - Contexto
     * @param {string} message - Mensaje de advertencia
     */
    static logWarning(context, message) {
        const warningLog = {
            timestamp: new Date().toISOString(),
            context,
            type: 'warning',
            message,
        };

        if (this.logs.length >= this.maxLogs) {
            this.logs.shift();
        }

        this.logs.push(warningLog);

        if (__DEV__) {
            console.log(`[Warning] ${context}: ${message}`);
        }
    }

    /**
     * Obtiene todos los logs (útil para debugging)
     */
    static getAllLogs() {
        return [...this.logs];
    }

    /**
     * Obtiene los últimos N logs
     */
    static getRecentLogs(count = 10) {
        return this.logs.slice(-count);
    }

    /**
     * Limpia todos los logs
     */
    static clearLogs() {
        this.logs = [];
    }

    /**
     * Wrapper para ejecutar código con manejo silencioso de errores
     * @param {Function} fn - Función a ejecutar
     * @param {string} context - Contexto de la operación
     * @param {*} defaultValue - Valor por defecto en caso de error
     */
    static async safeExecute(fn, context, defaultValue = null) {
        try {
            return await fn();
        } catch (error) {
            this.logError(context, error);
            return defaultValue;
        }
    }
}
