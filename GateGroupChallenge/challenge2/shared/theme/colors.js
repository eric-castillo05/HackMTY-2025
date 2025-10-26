// challenge1/shared/theme/colors.ts

export const colors = {
    // GateGroup Corporate Identity
    primary: '#010165',        // Azul principal
    primaryDark: '#B30510',    // Rojo oscuro
    primaryLight: '#FF1F2D',   // Rojo claro
    secondary: '#1A1A1A',      // Negro carbón

    // Backgrounds
    background: '#FAFAFA',
    surface: '#FFFFFF',
    card: '#FFFFFF',

    // Freshness Status Colors
    fresh: '#10B981',          // Verde - Fresco (>7 días)
    useSoon: '#F59E0B',        // Ámbar - Usar pronto (3-7 días)
    critical: '#EF4444',       // Rojo - Crítico (<3 días)
    expired: '#1A1A1A',        // Negro - Vencido

    // UI Elements
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    textLight: '#9CA3AF',
    border: '#E5E7EB',
    disabled: '#D1D5DB',

    // Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
    cardShadow: 'rgba(0, 0, 0, 0.1)',
}

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
}

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
}

export const fontSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
}

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
}

// Paper Theme Config
export const paperTheme = {
    colors: {
        primary: colors.primary,
        accent: colors.primaryLight,
        background: colors.background,
        surface: colors.surface,
        text: colors.text,
        error: colors.error,
        disabled: colors.disabled,
        placeholder: colors.textLight,
        backdrop: colors.overlay,
    },
    roundness: borderRadius.md,
};