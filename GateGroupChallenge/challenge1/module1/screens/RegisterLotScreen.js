// challenge1/module1/screens/RegisterLotScreen.js
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { colors, spacing, borderRadius, fontSize, shadows } from '../../shared/theme/colors';
import { CATEGORY_OPTIONS } from '../../shared/types';
import { ProductService } from '../services/productService';

export const RegisterLotScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        productName: '',
        lotNumber: '',
        expiryDate: new Date(),
        weight: '',
        quantity: '',
        category: 'meat',
        location: '',
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
        if (!formData.productName.trim()) {
            Alert.alert('Error', 'El nombre del producto es requerido');
            return false;
        }
        if (!formData.lotNumber.trim()) {
            Alert.alert('Error', 'El número de lote es requerido');
            return false;
        }
        if (!formData.weight.trim()) {
            Alert.alert('Error', 'El peso es requerido');
            return false;
        }
        if (!formData.quantity || parseInt(formData.quantity) <= 0) {
            Alert.alert('Error', 'La cantidad debe ser mayor a 0');
            return false;
        }
        if (!formData.location.trim()) {
            Alert.alert('Error', 'La ubicación es requerida');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const product = await ProductService.createProduct(formData);

            Alert.alert(
                '✅ Producto Registrado',
                `${product.productName} ha sido registrado exitosamente`,
                [
                    {
                        text: 'Ver QR',
                        onPress: () => navigation.navigate('ProductDetail', { productId: product.id }),
                    },
                    {
                        text: 'Registrar Otro',
                        onPress: () => {
                            setFormData({
                                productName: '',
                                lotNumber: '',
                                expiryDate: new Date(),
                                weight: '',
                                quantity: '',
                                category: 'meat',
                                location: '',
                            });
                        },
                    },
                    {
                        text: 'Ir al Inicio',
                        onPress: () => navigation.navigate('Home'),
                    },
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'No se pudo registrar el producto. Intenta nuevamente.');
            console.error('Error registering product:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
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

            {/* Category */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Categoría *</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={formData.category}
                        onValueChange={(value) => updateField('category', value)}
                        style={styles.picker}
                    >
                        {CATEGORY_OPTIONS.map(option => (
                            <Picker.Item
                                key={option.value}
                                label={option.label}
                                value={option.value}
                            />
                        ))}
                    </Picker>
                </View>
            </View>

            {/* Expiry Date */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Fecha de Expiración *</Text>
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={styles.dateText}>
                        📅 {formData.expiryDate.toLocaleDateString('es-MX')}
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

            {/* Weight and Quantity Row */}
            <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Peso *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="5.2 kg"
                        placeholderTextColor={colors.textLight}
                        value={formData.weight}
                        onChangeText={(text) => updateField('weight', text)}
                    />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
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
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Ubicación *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: Refrigerador A3"
                    placeholderTextColor={colors.textLight}
                    value={formData.location}
                    onChangeText={(text) => updateField('location', text)}
                />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
            >
                <Text style={styles.submitButtonText}>
                    {loading ? 'Registrando...' : '✅ Registrar Producto'}
                </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>* Campos requeridos</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.lg,
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
    pickerContainer: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
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
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    halfWidth: {
        flex: 1,
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
        opacity: 0.6,
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