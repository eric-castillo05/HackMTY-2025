import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { colors, spacing, fontSize, shadows } from '../theme/colors';

const ModuleItem = ({ title, subtitle, isActive, onPress, icon }) => (
  <TouchableOpacity
    style={[styles.moduleItem, isActive && styles.moduleItemActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.moduleIcon}>
      <Text style={[styles.iconText, isActive && styles.iconTextActive]}>{icon}</Text>
    </View>
    <View style={styles.moduleInfo}>
      <Text style={[styles.moduleTitle, isActive && styles.moduleTitleActive]}>
        {title}
      </Text>
      <Text style={[styles.moduleSubtitle, isActive && styles.moduleSubtitleActive]}>
        {subtitle}
      </Text>
    </View>
  </TouchableOpacity>
);

export const CustomDrawerContent = (props) => {
  const { state, navigation } = props;
  const currentRoute = state.routes[state.index].name;

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContent}
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>GATE GROUP</Text>
          <View style={styles.logoDivider} />
        </View>
        <Text style={styles.headerSubtitle}>Challenge Management System</Text>
      </View>

      <View style={styles.modulesSection}>
        <Text style={styles.sectionLabel}>MODULES</Text>
        
        <ModuleItem
          icon="QR"
          title="Module 1"
          subtitle="QR Scanner & History"
          isActive={currentRoute === 'Module1'}
          onPress={() => navigation.navigate('Module1')}
        />
        
        <ModuleItem
          icon="AI"
          title="Module 2"
          subtitle="Freshness Prediction Dashboard"
          isActive={currentRoute === 'Module2'}
          onPress={() => navigation.navigate('Module2')}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <Text style={styles.footerText}>HackMTY 2025</Text>
        <Text style={styles.footerVersion}>Version 1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    paddingTop: 0,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    backgroundColor: colors.primary,
  },
  logoContainer: {
    marginBottom: spacing.sm,
  },
  logoText: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: 1,
  },
  logoDivider: {
    height: 3,
    width: 60,
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  modulesSection: {
    flex: 1,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: spacing.md,
    marginLeft: spacing.sm,
  },
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 12,
    backgroundColor: 'transparent',
    transition: 'all 0.2s',
  },
  moduleItemActive: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primary,
  },
  iconTextActive: {
    color: colors.primary,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  moduleTitleActive: {
    color: colors.surface,
  },
  moduleSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  moduleSubtitleActive: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  footerDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  footerText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  footerVersion: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: 4,
  },
});
