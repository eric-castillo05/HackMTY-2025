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
            Alert.alert('Required Fields', 'Please ensure all required fields are correctly completed.');
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
            const generateUUID = () => {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    const r = Math.random() * 16 | 0;
                    const v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };

            const productData = {
                product_id: `PRD-${Date.now()}`,
                uuidProduct: generateUUID(),
                product_name: formData.productName,
                lotsName: formData.lotNumber,
                expiry_date: formData.expiryDate.toISOString(),
                quantity: formData.quantity,
                urlImage: '',
                status: 'VALID',
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
                    'Success!',
                    'Product registered successfully.',
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
                        'Partial Success',
                        `Unable to connect to the server; the product has been saved locally.\n\nError: ${apiResponse.error}`,
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
                    Alert.alert('Error', 'Failed to save the product locally.');
                }
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
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
                <Text style={styles.title}>Register New Batch</Text>
                <Text style={styles.subtitle}>
                    Complete the product information below to register a new batch in the inventory.
                </Text>
            </View>

            {/* Product Name */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Product Name *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: Premium Chicken Breast"
                    placeholderTextColor={colors.textLight}
                    value={formData.productName}
                    onChangeText={(text) => updateField('productName', text)}
                />
            </View>

            {/* Lot Number */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Batch Number *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: LOT-A-2024-10"
                    placeholderTextColor={colors.textLight}
                    value={formData.lotNumber}
                    onChangeText={(text) => updateField('lotNumber', text)}
                    autoCapitalize="characters"
                />
            </View>

            {/* Expiry Date */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Expiration Date *</Text>
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
                <Text style={styles.label}>Quantity *</Text>
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
                <Text style={styles.label}>Unit of Measure *</Text>
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
                            Mililiters (ml)
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
                            Miligrams (mg)
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
                    {loading ? 'Saving...' : 'Register Product'}
                </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>* Required Fields</Text>
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