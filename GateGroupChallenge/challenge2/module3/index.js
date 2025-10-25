// challenge2/module3/index.js

// Export all screens
export { HomeScreen } from './screens/HomeScreen';
export { RegisterLotScreen } from './screens/RegisterLotScreen';
export { ScannerScreen } from './screens/ScannerScreen';
export { InventoryScreen } from './screens/InventoryScreen';
export { ProductDetailScreen } from './screens/ProductDetailScreen';

// Export all components
export { FreshnessIndicator } from './components/FreshnessIndicator';
export { ProductCard } from './components/ProductCard';
export { StatCard } from './components/StatCard';
export { QRCodeGenerator } from './components/QRCodeGenerator';

// Export services
export { StorageService } from './services/storageService';
export { ProductService } from './services/productService';

// Export navigator: re-export Module1Navigator as Module3Navigator so imports
// that expect Module3 (from challenge1) resolve correctly.
export { Module3Navigator } from './navigation/Module3Navigator';