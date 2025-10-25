// challenge1/shared/utils/dateUtils.js
import { differenceInDays, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Calculates how many days until a product expires
 */
export const getDaysUntilExpiry = (expiryDate) => {
    const expiry = parseISO(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return differenceInDays(expiry, today);
};

/**
 * Determines freshness status based on days left
 */
export const getFreshnessStatus = (expiryDate) => {
    const daysLeft = getDaysUntilExpiry(expiryDate);

    if (daysLeft < 0) return 'expired';
    if (daysLeft <= 3) return 'critical';
    if (daysLeft <= 7) return 'useSoon';
    return 'fresh';
};

/**
 * Gets color by freshness status
 */
export const getFreshnessColor = (status) => {
    const colors = {
        fresh: '#10B981',
        useSoon: '#F59E0B',
        critical: '#EF4444',
        expired: '#1A1A1A',
    };
    return colors[status];
};

/**
 * Gets emoji by freshness status
 */
export const getFreshnessEmoji = (status) => {
    const emojis = {
        fresh: '🟢',
        useSoon: '🟡',
        critical: '🔴',
        expired: '⚫',
    };
    return emojis[status];
};

/**
 * Gets label by freshness status
 */
export const getFreshnessLabel = (status) => {
    const labels = {
        fresh: 'Fresco',
        useSoon: 'Usar Pronto',
        critical: 'Crítico',
        expired: 'Vencido',
    };
    return labels[status];
};

/**
 * Formats a date for display
 */
export const formatDisplayDate = (dateString) => {
    try {
        const date = parseISO(dateString);
        return format(date, "d 'de' MMMM, yyyy", { locale: es });
    } catch {
        return dateString;
    }
};

/**
 * Formats a short date
 */
export const formatShortDate = (dateString) => {
    try {
        const date = parseISO(dateString);
        return format(date, 'dd/MM/yyyy');
    } catch {
        return dateString;
    }
};

/**
 * Gets descriptive message for time left
 */
export const getExpiryMessage = (expiryDate) => {
    const daysLeft = getDaysUntilExpiry(expiryDate);

    if (daysLeft < 0) {
        const daysExpired = Math.abs(daysLeft);
        return `Venció hace ${daysExpired} día${daysExpired !== 1 ? 's' : ''}`;
    }

    if (daysLeft === 0) return 'Vence hoy';
    if (daysLeft === 1) return 'Vence mañana';

    return `${daysLeft} días restantes`;
};

/**
 * Validates if a date is valid
 */
export const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date.getTime());
};