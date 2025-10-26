// challenge1/module1/screens/ScannerScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Vibration,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors, spacing, borderRadius, fontSize } from '../../shared/theme/colors';
import { StorageService } from '../services/storageService';

export const ScannerScreen = ({ navigation }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [flashEnabled, setFlashEnabled] = useState(false);

    const handleBarCodeScanned = async ({ type, data }) => {
        if (scanned) return;

        setScanned(true);
        Vibration.vibrate(100);

        try {
            // Try to find product by QR code
            const product = await StorageService.getProductByQR(data);

            if (product) {
                // Product found - navigate to detail
                navigation.navigate('ProductDetail', { productId: product.id });
            } else {
                // Product not found
                Alert.alert(
                    'Product Not Found',
                    'The scanned product is not registered in the inventory.',
                    [
                        {
                            text: 'Scan Again',
                            onPress: () => setScanned(false),
                        },
                        {
                            text: 'Register Product',
                            onPress: () => navigation.navigate('RegisterLot'),
                        },
                    ]
                );
            }
        } catch (error) {
            console.error('Error processing QR:', error);
            Alert.alert(
                'Error',
                'An error occurred while processing the scanned QR code. Try again.',
                [{ text: 'OK', onPress: () => setScanned(false) }]
            );
        }
    };

    if (!permission) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.message}>Camera permission request...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emoji}>📷</Text>
                <Text style={styles.message}>Camera access denied</Text>
                <Text style={styles.description}>
                    To scan product QR codes, please enable camera access.
                </Text>
                <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={requestPermission}
                >
                    <Text style={styles.permissionButtonText}>Request Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
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
                                style={styles.backButton}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={styles.backButtonText}>← Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.flashButton}
                                onPress={() => setFlashEnabled(!flashEnabled)}
                            >
                                <Text style={styles.flashIcon}>
                                    {flashEnabled ? '💡' : '🔦'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.title}>Scan Product</Text>
                        <Text style={styles.instructions}>
                            Align the QR code within the frame to scan
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
                        {scanned ? (
                            <TouchableOpacity
                                style={styles.scanAgainButton}
                                onPress={() => setScanned(false)}
                            >
                                <Text style={styles.scanAgainText}>🔄Scan again</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={styles.hint}>
                                Point the camera at a product QR code to scan
                            </Text>
                        )}
                    </View>
                </View>
            </CameraView>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    backButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    backButtonText: {
        color: colors.surface,
        fontSize: fontSize.md,
        fontWeight: '600',
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
        fontSize: fontSize.xl,
    },
    title: {
        fontSize: fontSize.xxl,
        fontWeight: '700',
        color: colors.surface,
        marginBottom: spacing.xs,
    },
    instructions: {
        fontSize: fontSize.md,
        color: 'rgba(255,255,255,0.8)',
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
        fontSize: fontSize.md,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
    },
    scanAgainButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
    },
    scanAgainText: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.surface,
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
});