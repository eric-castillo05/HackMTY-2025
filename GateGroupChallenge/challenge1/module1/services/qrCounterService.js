// challenge1/module1/services/qrCounterService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackendService } from './backendService';
import { ErrorHandler } from '../../../shared/services/errorHandler';

const QR_SCANS_KEY = '@qr_scans';

/**
 * Service to handle QR scan counting
 */
export class QRCounterService {
    /**
     * Get all scanned QR codes with their counts
     */
    static async getAllScans() {
        try {
            const data = await AsyncStorage.getItem(QR_SCANS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            ErrorHandler.logError('QRCounterService.getAllScans', error);
            return [];
        }
    }

    /**
     * Record a QR scan and verify with Backend
     * @param {string} qrCode - The scanned QR code
     * @returns {object} The updated scan record with count and Backend data
     */
    static async recordScan(qrCode) {
        try {
            // Verify QR code with Backend
            const backendData = await BackendService.verificarProducto(qrCode);
            
            const scans = await this.getAllScans();
            
            // Find existing scan
            const existingIndex = scans.findIndex(s => s.qrCode === qrCode);
            
            const scanRecord = {
                qrCode,
                backendData,
                isValid: backendData !== null,
                lastScanned: new Date().toISOString(),
            };
            
            if (existingIndex !== -1) {
                // Increment count
                scans[existingIndex].count += 1;
                scans[existingIndex].lastScanned = scanRecord.lastScanned;
                scans[existingIndex].backendData = backendData;
                scans[existingIndex].isValid = scanRecord.isValid;
            } else {
                // Add new scan
                scans.push({
                    ...scanRecord,
                    count: 1,
                    firstScanned: new Date().toISOString(),
                });
            }
            
            await AsyncStorage.setItem(QR_SCANS_KEY, JSON.stringify(scans));
            
            // Return the updated record
            return scans[existingIndex !== -1 ? existingIndex : scans.length - 1];
        } catch (error) {
            ErrorHandler.logError('QRCounterService.recordScan', error);
            return { qrCode, isValid: false, count: 0, backendData: null, lastScanned: new Date().toISOString() };
        }
    }

    /**
     * Get scan count for a specific QR code
     */
    static async getScanCount(qrCode) {
        try {
            const scans = await this.getAllScans();
            const scan = scans.find(s => s.qrCode === qrCode);
            return scan ? scan.count : 0;
        } catch (error) {
            ErrorHandler.logError('QRCounterService.getScanCount', error);
            return 0;
        }
    }

    /**
     * Clear all scan history
     */
    static async clearAllScans() {
        try {
            await AsyncStorage.removeItem(QR_SCANS_KEY);
        } catch (error) {
            ErrorHandler.logError('QRCounterService.clearAllScans', error);
        }
    }

    /**
     * Delete a specific scan record
     */
    static async deleteScan(qrCode) {
        try {
            const scans = await this.getAllScans();
            const filtered = scans.filter(s => s.qrCode !== qrCode);
            await AsyncStorage.setItem(QR_SCANS_KEY, JSON.stringify(filtered));
        } catch (error) {
            ErrorHandler.logError('QRCounterService.deleteScan', error);
        }
    }
}
