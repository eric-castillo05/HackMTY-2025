// challenge1/module1/screens/ScannerScreen.js
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Vibration,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize } from '../../shared/theme/colors';
import { QRCounterService } from '../services/qrCounterService';
import { ProductService } from '../../shared/services/productService';
import { BackendService } from '../services/backendService';

export const ScannerScreen = ({ navigation }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [flashEnabled, setFlashEnabled] = useState(false);
    const [lastScan, setLastScan] = useState(null);
    const [isFocused, setIsFocused] = useState(true);
    const [backendVerification, setBackendVerification] = useState(null);

    // Reset camera state when screen is focused/unfocused
    useFocusEffect(
        useCallback(() => {
            setIsFocused(true);
            setScanned(false);
            
            return () => {
                setIsFocused(false);
            };
        }, [])
    );

    const handleBarCodeScanned = async ({ type, data }) => {
        if (scanned) return;

        setScanned(true);
        Vibration.vibrate(100);

        try {
            // Record the scan and get count
            const scanRecord = await QRCounterService.recordScan(data);
            setLastScan(scanRecord);
            setBackendVerification(scanRecord.backendData);

            // Save product to inventory if valid
            if (scanRecord.isValid && scanRecord.backendData) {
                await ProductService.saveProductFromQR(scanRecord.backendData);
            }

            // Auto-reset after 4 seconds to allow continuous scanning
            setTimeout(() => {
                setScanned(false);
                setBackendVerification(null);
            }, 4000);
        } catch (error) {
            setScanned(false);
        }
    };

    if (!permission) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.message}>Solicitando permiso de cámara...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emoji}>📷</Text>
                <Text style={styles.message}>Sin acceso a la cámara</Text>
                <Text style={styles.description}>
                    Por favor, habilita los permisos de cámara en la configuración
                </Text>
                <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={requestPermission}
                >
                    <Text style={styles.permissionButtonText}>Solicitar Permiso</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {isFocused && (
                <CameraView
                    style={styles.camera}
                    facing="back"
                    enableTorch={flashEnabled}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ['qr'],
                    }}
                >
                {/* Overlay */}
                <View style={styles.overlay}>
                    {/* Top Section */}
                    <View style={styles.topSection}>
                        <View style={styles.header}>
                            <TouchableOpacity
                                style={styles.flashButton}
                                onPress={() => setFlashEnabled(!flashEnabled)}
                            >
                                <Text style={styles.flashIcon}>
                                    {flashEnabled ? '●' : '○'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.title}>QR SCANNER</Text>
                        <Text style={styles.subtitle}>AVIATION VERIFICATION SYSTEM</Text>
                        <Text style={styles.instructions}>
                            Align QR code within the frame
                        </Text>
                    </View>

                    {/* Scanning Frame */}
                    <View style={styles.middleSection}>
                        <View style={styles.scanFrame}>
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                        </View>
                    </View>

                    {/* Bottom Section */}
                    <View style={styles.bottomSection}>
                        {lastScan ? (
                            <View style={styles.resultContainer}>
                                <View style={styles.statusBadge}>
                                    <View style={[styles.statusIndicator, { 
                                        backgroundColor: lastScan.isValid ? '#00FF00' : '#FF0000' 
                                    }]} />
                                    <Text style={styles.statusText}>
                                        {lastScan.isValid ? 'VERIFIED' : 'INVALID'}
                                    </Text>
                                </View>
                                
                                {/* Backend Verification Status */}
                                {backendVerification && (
                                    <View style={[styles.expirationBadge, {
                                        backgroundColor: backendVerification.status === 'VIGENTE' 
                                            ? 'rgba(0, 255, 0, 0.2)' 
                                            : backendVerification.status === 'VENCE HOY'
                                            ? 'rgba(255, 165, 0, 0.2)'
                                            : 'rgba(255, 0, 0, 0.2)',
                                        borderColor: backendVerification.status === 'VIGENTE'
                                            ? '#00FF00'
                                            : backendVerification.status === 'VENCE HOY'
                                            ? '#FFA500'
                                            : '#FF0000',
                                    }]}>
                                        <Text style={[styles.expirationText, {
                                            color: backendVerification.status === 'VIGENTE'
                                                ? '#00FF00'
                                                : backendVerification.status === 'VENCE HOY'
                                                ? '#FFA500'
                                                : '#FF0000',
                                        }]}>
                                            {backendVerification.status === 'VIGENTE' && '✓ VIGENTE'}
                                            {backendVerification.status === 'VENCE HOY' && '⚠ VENCE HOY'}
                                            {backendVerification.status === 'VENCIDO' && '✗ EXPIRADO'}
                                        </Text>
                                        
                                        {backendVerification.product_name && (
                                            <Text style={styles.productName}>
                                                {backendVerification.product_name}
                                            </Text>
                                        )}
                                        
                                        <View style={styles.backendDataContainer}>
                                            {backendVerification.quantity && (
                                                <Text style={styles.backendDataText}>
                                                    Cantidad: {backendVerification.quantity}
                                                </Text>
                                            )}
                                            {backendVerification.days_left !== undefined && backendVerification.status === 'VIGENTE' && (
                                                <Text style={styles.backendDataText}>
                                                    {backendVerification.days_left} días restantes
                                                </Text>
                                            )}
                                            {backendVerification.expiry_date && (
                                                <Text style={styles.backendDataText}>
                                                    Vence: {backendVerification.expiry_date}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                )}
                                
                                <View style={styles.scanInfo}>
                                    <Text style={styles.scanCount}>SCAN #{lastScan.count}</Text>
                                    {lastScan.count > 1 && (
                                        <View style={styles.repeatIndicator}>
                                            <Text style={styles.repeatText}>DUPLICATE</Text>
                                        </View>
                                    )}
                                </View>
                                
                                {!backendVerification && lastScan.isValid === false && (
                                    <View style={styles.dataContainer}>
                                        <Text style={styles.errorText}>QR CODE NOT FOUND</Text>
                                        <Text style={styles.errorSubtext}>Code not registered in system</Text>
                                    </View>
                                )}
                            </View>
                        ) : (
                            <Text style={styles.hint}>
                                Ready to scan
                            </Text>
                        )}
                    </View>
                </View>
                </CameraView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.secondary,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: spacing.xl,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    topSection: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    flashButton: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    flashIcon: {
        fontSize: fontSize.lg,
        color: colors.surface,
        fontWeight: 'bold',
    },
    title: {
        fontSize: fontSize.xxxl,
        fontWeight: '900',
        color: colors.surface,
        letterSpacing: 2,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSize.xs,
        fontWeight: '600',
        color: colors.primary,
        letterSpacing: 1.5,
        marginBottom: spacing.md,
    },
    instructions: {
        fontSize: fontSize.sm,
        color: 'rgba(255,255,255,0.7)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    middleSection: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: {
        width: 250,
        height: 250,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: colors.primary,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: borderRadius.md,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: borderRadius.md,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: borderRadius.md,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: borderRadius.md,
    },
    bottomSection: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    hint: {
        fontSize: fontSize.sm,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    resultContainer: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: spacing.lg,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.sm,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: spacing.sm,
    },
    statusText: {
        fontSize: fontSize.md,
        fontWeight: '700',
        color: colors.surface,
        letterSpacing: 1.5,
    },
    dataContainer: {
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    dataLabel: {
        fontSize: fontSize.xs,
        fontWeight: '600',
        color: colors.primary,
        marginTop: spacing.sm,
        marginBottom: 2,
        letterSpacing: 1,
    },
    dataValue: {
        fontSize: fontSize.md,
        fontWeight: '500',
        color: colors.surface,
        marginBottom: spacing.xs,
    },
    scanInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.md,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    scanCount: {
        fontSize: fontSize.sm,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: 1,
    },
    repeatIndicator: {
        backgroundColor: colors.warning + '30',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.warning,
    },
    repeatText: {
        fontSize: fontSize.xs,
        fontWeight: '700',
        color: colors.warning,
        letterSpacing: 1,
    },
    errorText: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.error,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    errorSubtext: {
        fontSize: fontSize.sm,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
    },
    emoji: {
        fontSize: 64,
        marginBottom: spacing.lg,
    },
    message: {
        fontSize: fontSize.xl,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    description: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    permissionButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
    },
    permissionButtonText: {
        fontSize: fontSize.md,
        fontWeight: '700',
        color: colors.surface,
    },
    expirationBadge: {
        width: '100%',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        marginTop: spacing.md,
        alignItems: 'center',
    },
    expirationText: {
        fontSize: fontSize.lg,
        fontWeight: '900',
        letterSpacing: 2,
        textAlign: 'center',
    },
    expirationMessage: {
        fontSize: fontSize.sm,
        color: 'rgba(255,255,255,0.8)',
        marginTop: spacing.xs,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    productName: {
        fontSize: fontSize.md,
        color: colors.surface,
        marginTop: spacing.xs,
        textAlign: 'center',
        fontWeight: '600',
    },
    backendDataContainer: {
        marginTop: spacing.md,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        width: '100%',
    },
    backendDataText: {
        fontSize: fontSize.sm,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        marginTop: spacing.xs,
        letterSpacing: 0.5,
    },
});
