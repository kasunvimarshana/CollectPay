/**
 * Home Screen
 * Main dashboard for authenticated users
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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

  const handleLogout = async () => {
    await logout();
  };

  const navigateTo = (screen: string) => {
    (navigation.navigate as any)(screen);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + THEME.spacing.lg }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Ledger Dashboard</Text>
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
            >
              <Text style={styles.menuIcon}>👥</Text>
              <Text style={styles.menuText}>Suppliers</Text>
            </TouchableOpacity>
          )}

          {canView(user, 'products') && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigateTo('ProductList')}
            >
              <Text style={styles.menuIcon}>📦</Text>
              <Text style={styles.menuText}>Products</Text>
            </TouchableOpacity>
          )}

          {canView(user, 'rates') && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigateTo('RateList')}
            >
              <Text style={styles.menuIcon}>💵</Text>
              <Text style={styles.menuText}>Rates</Text>
            </TouchableOpacity>
          )}

          {canView(user, 'collections') && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigateTo('CollectionList')}
            >
              <Text style={styles.menuIcon}>📊</Text>
              <Text style={styles.menuText}>Collections</Text>
            </TouchableOpacity>
          )}

          {canView(user, 'payments') && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigateTo('PaymentList')}
            >
              <Text style={styles.menuIcon}>💰</Text>
              <Text style={styles.menuText}>Payments</Text>
            </TouchableOpacity>
          )}

          {canView(user, 'users') && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigateTo('UserList')}
            >
              <Text style={styles.menuIcon}>👤</Text>
              <Text style={styles.menuText}>Users</Text>
            </TouchableOpacity>
          )}

          {canView(user, 'roles') && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigateTo('RoleList')}
            >
              <Text style={styles.menuIcon}>🔐</Text>
              <Text style={styles.menuText}>Roles</Text>
            </TouchableOpacity>
          )}

          {/* Reports available to all authenticated users */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigateTo('Reports')}
          >
            <Text style={styles.menuIcon}>📈</Text>
            <Text style={styles.menuText}>Reports</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
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
    fontSize: 40,
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
  logoutButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.bold,
  },
});
