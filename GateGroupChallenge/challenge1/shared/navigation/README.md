# Drawer Navigation System

Professional drawer menu implementation for module navigation in the Gate Group Challenge app.

## Features

- Elegant sliding drawer menu
- Module navigation between Module 1 and Module 2
- Custom branded header with Gate Group identity
- Active state indicators
- Consistent design system using corporate colors
- Smooth animations and transitions

## Structure

```
shared/navigation/
├── DrawerNavigator.js        # Main drawer navigator configuration
├── CustomDrawerContent.js    # Custom drawer content and styling
└── index.js                  # Export barrel
```

## Design Specifications

### Colors
- **Primary Red**: #E30613 (Gate Group brand color)
- **Surface White**: #FFFFFF
- **Text Primary**: #1A1A1A
- **Text Secondary**: #6B7280

### Components

**Header Section**
- Gate Group branding
- Challenge Management System subtitle
- Primary red background

**Module Items**
- Icon badge with module identifier
- Title and subtitle
- Active state with red background
- Hover/press feedback

**Footer Section**
- HackMTY 2025 branding
- Version number

## Usage

The drawer is automatically integrated into the app via `App.js`:

```javascript
import { DrawerNavigator } from './challenge1/shared/navigation/DrawerNavigator';

<NavigationContainer>
  <DrawerNavigator />
</NavigationContainer>
```

### Opening the Drawer

The drawer can be opened by:
1. Pressing the hamburger menu button in the header
2. Swiping from the left edge of the screen
3. Programmatically: `navigation.openDrawer()`

### Adding New Modules

To add a new module to the drawer:

1. Add the screen to `DrawerNavigator.js`:
```javascript
<Drawer.Screen
  name="Module3"
  component={Module3Navigator}
  options={{
    headerShown: false,
    title: 'Module 3',
  }}
/>
```

2. Add the menu item to `CustomDrawerContent.js`:
```javascript
<ModuleItem
  icon="M3"
  title="Module 3"
  subtitle="Description"
  isActive={currentRoute === 'Module3'}
  onPress={() => navigation.navigate('Module3')}
/>
```

## Styling Guidelines

The drawer follows the corporate design system:

- **Spacing**: Consistent padding using the spacing scale (sm: 8, md: 16, lg: 24)
- **Typography**: 
  - Header: 24px, bold
  - Module title: 16px, semibold
  - Subtitle: 12px, regular
- **Shadows**: Subtle elevation (md shadow)
- **Border Radius**: 12px for cards and containers

## Dependencies

- `@react-navigation/drawer`
- `react-native-gesture-handler`
- `react-native-reanimated`

## Notes

- The drawer width is fixed at 300px for optimal usability
- Swipe edge width is set to 50px for easy access
- All text is professional and emoji-free
- Consistent with Gate Group brand guidelines
