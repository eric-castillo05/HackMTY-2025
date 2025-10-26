// challenge1/module1/screens/RegisterLotScreen.js
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Platform,
    Alert,
    SafeAreaView,
    KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../shared/theme/colors';
import { StorageService } from '../services/storageService';
import { ApiService } from '../services/apiService';

export const RegisterLotScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        productName: '',
        lotNumber: '',
        expiryDate: new Date(),
        quantity: '',
        unit: 'ml', // 'ml' o 'mg'
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            updateField('expiryDate', selectedDate);
        }
    };

    const validateForm = () => {
        if (!formData.productName.trim() || !formData.lotNumber.trim() || !formData.quantity || parseInt(formData.quantity) <= 0) {
            Alert.alert('Campos Requeridos', 'Por favor completa todos los campos obligatorios correctamente.');
            return false;
        }
        return true;
    };

    const resetForm = () => {
        setFormData({
            productName: '',
            lotNumber: '',
            expiryDate: new Date(),
            quantity: '',
            unit: 'ml',
        });
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Generar UUID v4 para el producto
            const generateUUID = () => {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    const r = Math.random() * 16 | 0;
                    const v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };

            // Formatear datos según el esquema requerido
            const productData = {
                product_id: `PRD-${Date.now()}`,
                uuidProduct: generateUUID(),
                product_name: formData.productName,
                lotsName: formData.lotNumber,
                expiry_date: formData.expiryDate.toISOString(),
                quantity: formData.quantity,
                urlImage: '',
                status: 'VIGENTE',
                mlg: formData.unit,
            };

            // Enviar a la base de datos usando axios
            const apiResponse = await ApiService.registerProduct(productData);

            if (apiResponse.success) {
                // Guardar también localmente con el uuidProduct y urlImage de la respuesta
                const productToSave = {
                    ...productData,
                    uuidProduct: apiResponse.data?.uuidProduct || productData.uuidProduct,
                    urlImage: apiResponse.data?.urlImage || productData.urlImage,
                };
                await StorageService.saveProduct(productToSave);
                
                Alert.alert(
                    '¡Éxito!',
                    'El producto ha sido registrado correctamente en la base de datos.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                resetForm();
                                navigation.navigate('Tabs', { screen: 'Home' });
                            }
                        }
                    ]
                );
            } else {
                // Si falla el API, guardar solo localmente
                const savedProduct = await StorageService.saveProduct(productData);
                
                if (savedProduct) {
                    Alert.alert(
                        'Guardado Localmente',
                        `No se pudo conectar con el servidor, pero el producto se guardó localmente.\n\nError: ${apiResponse.error}`,
                        [
                            {
                                text: 'OK',
                                onPress: () => {
                                    resetForm();
                                    navigation.navigate('Tabs', { screen: 'Home' });
                                }
                            }
                        ]
                    );
                } else {
                    Alert.alert('Error', 'No se pudo registrar el producto ni localmente.');
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Ocurrió un error inesperado al registrar el producto.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Registrar Nuevo Lote</Text>
                <Text style={styles.subtitle}>
                    Completa la información del producto
                </Text>
            </View>

            {/* Product Name */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre del Producto *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: Pechuga de Pollo Premium"
                    placeholderTextColor={colors.textLight}
                    value={formData.productName}
                    onChangeText={(text) => updateField('productName', text)}
                />
            </View>

            {/* Lot Number */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Número de Lote *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: LOT-A-2024-10"
                    placeholderTextColor={colors.textLight}
                    value={formData.lotNumber}
                    onChangeText={(text) => updateField('lotNumber', text)}
                    autoCapitalize="characters"
                />
            </View>

            {/* Expiry Date */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Fecha de Expiración *</Text>
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={styles.dateText}>
                        {formData.expiryDate.toLocaleDateString('es-MX')}
                    </Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={formData.expiryDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        minimumDate={new Date()}
                    />
                )}
            </View>

            {/* Quantity */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Cantidad *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="12"
                    placeholderTextColor={colors.textLight}
                    value={formData.quantity}
                    onChangeText={(text) => updateField('quantity', text)}
                    keyboardType="numeric"
                />
            </View>

            {/* Unit Selection */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Unidad de Medida *</Text>
                <View style={styles.unitContainer}>
                    <TouchableOpacity
                        style={[
                            styles.unitButton,
                            formData.unit === 'ml' && styles.unitButtonActive,
                        ]}
                        onPress={() => updateField('unit', 'ml')}
                    >
                        <Text
                            style={[
                                styles.unitButtonText,
                                formData.unit === 'ml' && styles.unitButtonTextActive,
                            ]}
                        >
                            Mililitros (ml)
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.unitButton,
                            formData.unit === 'mg' && styles.unitButtonActive,
                        ]}
                        onPress={() => updateField('unit', 'mg')}
                    >
                        <Text
                            style={[
                                styles.unitButtonText,
                                formData.unit === 'mg' && styles.unitButtonTextActive,
                            ]}
                        >
                            Miligramos (mg)
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
            >
                <Text style={styles.submitButtonText}>
                    {loading ? 'Registrando...' : 'Registrar Producto'}
                </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>* Campos requeridos</Text>
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.lg,
        paddingTop: Platform.OS === 'ios' ? spacing.md : spacing.lg,
    },
    header: {
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: fontSize.xxl,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: fontSize.md,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dateButton: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dateText: {
        fontSize: fontSize.md,
        color: colors.text,
    },
    unitContainer: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    unitButton: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    unitButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    unitButtonText: {
        fontSize: fontSize.md,
        color: colors.text,
        fontWeight: '600',
    },
    unitButtonTextActive: {
        color: colors.surface,
    },
    submitButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
        marginTop: spacing.lg,
        ...shadows.md,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.surface,
    },
    footer: {
        marginTop: spacing.md,
        alignItems: 'center',
    },
    footerText: {
        fontSize: fontSize.sm,
        color: colors.textLight,
    },
});