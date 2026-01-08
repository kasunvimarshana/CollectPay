/**
 * Home Screen
 * Main dashboard for authenticated users
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { canView } from '../../core/utils/permissions';
import { SyncStatusIndicator } from '../components/SyncStatusIndicator';
import THEME from '../../core/constants/theme';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    // Show confirmation dialog
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await logout();
              // Navigation will be handled automatically by auth state change
            } catch (error: any) {
              // Show error alert if logout fails critically
              Alert.alert(
                'Logout Error',
                'An error occurred during logout. Please try again.',
                [{ text: 'OK' }]
              );
              console.error('Logout error:', error);
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const navigateTo = (screen: string) => {
    (navigation.navigate as any)(screen);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + THEME.spacing.lg }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Welcome, {String(user?.name || 'User')}</Text>
            <Text style={styles.role}>Role: {String(user?.role?.display_name || 'N/A')}</Text>
          </View>
          <SyncStatusIndicator showDetails={true} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.menuGrid}>
          {canView(user, 'suppliers') && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigateTo('SupplierList')}
              accessibilityRole="button"
              accessibilityLabel="Suppliers"
              accessibilityHint="View and manage suppliers"
            >
              <Text style={styles.menuIcon}>👥</Text>
              <Text style={styles.menuText}>Suppliers</Text>
            </TouchableOpacity>
          )}

          {canView(user, 'products') && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigateTo('ProductList')}
              accessibilityRole="button"
              accessibilityLabel="Products"
              accessibilityHint="View and manage products"
            >
              <Text style={styles.menuIcon}>📦</Text>
              <Text style={styles.menuText}>Products</Text>
            </TouchableOpacity>
          )}

          {canView(user, 'rates') && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigateTo('RateList')}
              accessibilityRole="button"
              accessibilityLabel="Rates"
              accessibilityHint="View and manage product rates"
            >
              <Text style={styles.menuIcon}>💵</Text>
              <Text style={styles.menuText}>Rates</Text>
            </TouchableOpacity>
          )}

          {canView(user, 'collections') && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigateTo('CollectionList')}
              accessibilityRole="button"
              accessibilityLabel="Collections"
              accessibilityHint="View and record collections"
            >
              <Text style={styles.menuIcon}>📊</Text>
              <Text style={styles.menuText}>Collections</Text>
            </TouchableOpacity>
          )}

          {canView(user, 'payments') && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigateTo('PaymentList')}
              accessibilityRole="button"
              accessibilityLabel="Payments"
              accessibilityHint="View and record payments"
            >
              <Text style={styles.menuIcon}>💰</Text>
              <Text style={styles.menuText}>Payments</Text>
            </TouchableOpacity>
          )}

          {canView(user, 'users') && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigateTo('UserList')}
              accessibilityRole="button"
              accessibilityLabel="Users"
              accessibilityHint="View and manage users"
            >
              <Text style={styles.menuIcon}>👤</Text>
              <Text style={styles.menuText}>Users</Text>
            </TouchableOpacity>
          )}

          {canView(user, 'roles') && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigateTo('RoleList')}
              accessibilityRole="button"
              accessibilityLabel="Roles"
              accessibilityHint="View and manage user roles"
            >
              <Text style={styles.menuIcon}>🔐</Text>
              <Text style={styles.menuText}>Roles</Text>
            </TouchableOpacity>
          )}

          {/* Reports available to all authenticated users */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigateTo('Reports')}
            accessibilityRole="button"
            accessibilityLabel="Reports"
            accessibilityHint="View analytics and reports"
          >
            <Text style={styles.menuIcon}>📈</Text>
            <Text style={styles.menuText}>Reports</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]} 
          onPress={handleLogout}
          disabled={isLoggingOut}
          accessibilityRole="button"
          accessibilityLabel="Logout"
          accessibilityHint="Log out of your account"
        >
          {isLoggingOut ? (
            <ActivityIndicator color={THEME.colors.white} />
          ) : (
            <Text style={styles.logoutButtonText}>Logout</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    backgroundColor: THEME.colors.primary,
    padding: THEME.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.white,
    marginBottom: THEME.spacing.sm,
  },
  subtitle: {
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.white,
    marginBottom: THEME.spacing.xs,
  },
  role: {
    fontSize: THEME.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    padding: THEME.spacing.lg,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    marginBottom: THEME.spacing.base,
    ...THEME.shadows.base,
  },
  menuIcon: {
    fontSize: THEME.typography.fontSize.huge,
    marginBottom: THEME.spacing.sm,
  },
  menuText: {
    fontSize: THEME.typography.fontSize.base,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.textPrimary,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: THEME.colors.error,
    paddingVertical: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
    marginTop: THEME.spacing.lg,
    marginBottom: THEME.spacing.xxxl,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.bold,
  },
});
