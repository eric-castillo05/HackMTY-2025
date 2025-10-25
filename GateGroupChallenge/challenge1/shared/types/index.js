// challenge1/shared/types/index.js

// FreshnessStatus values
const FreshnessStatus = ['fresh', 'useSoon', 'critical', 'expired'];

// ProductCategory values
const ProductCategory = [
    'meat',
    'dairy',
    'bakery',
    'beverages',
    'vegetables',
    'snacks',
    'condiments',
    'other'
];

// CATEGORY_LABELS object
const CATEGORY_LABELS = {
    meat: '🥩 Carnes',
    dairy: '🥛 Lácteos',
    bakery: '🥖 Panadería',
    beverages: '🥤 Bebidas',
    vegetables: '🥬 Vegetales',
    snacks: '🍪 Snacks',
    condiments: '🧂 Condimentos',
    other: '📦 Otros',
};

// CATEGORY_OPTIONS array
const CATEGORY_OPTIONS = [
    { label: '🥩 Carnes', value: 'meat' },
    { label: '🥛 Lácteos', value: 'dairy' },
    { label: '🥖 Panadería', value: 'bakery' },
    { label: '🥤 Bebidas', value: 'beverages' },
    { label: '🥬 Vegetales', value: 'vegetables' },
    { label: '🍪 Snacks', value: 'snacks' },
    { label: '🧂 Condimentos', value: 'condiments' },
    { label: '📦 Otros', value: 'other' },
];

// Export all
module.exports = {
    FreshnessStatus,
    ProductCategory,
    CATEGORY_LABELS,
    CATEGORY_OPTIONS
};