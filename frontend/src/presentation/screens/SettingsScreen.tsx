/**
 * Settings Screen
 * Centralized operational actions for database management and synchronization
 * Protected by admin/manager permissions
 */

import React, { useState, useEffect } from 'react';
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
import { hasAnyRole, ROLES } from '../../core/utils/permissions';
import LocalStorageService from '../../infrastructure/storage/LocalStorageService';
import SyncService from '../../application/services/SyncService';
import THEME from '../../core/constants/theme';
import { useNetworkStatus } from '../../application/hooks/useNetworkStatus';
import Logger from '../../core/utils/Logger';
import { NavigationProp } from '../../types/navigation';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { networkStatus } = useNetworkStatus();

  const [isClearing, setIsClearing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [lastSyncMessage, setLastSyncMessage] = useState('');

  // Check permissions - only admin and manager can access settings
  const hasAccess = hasAnyRole(user, [ROLES.ADMIN, ROLES.MANAGER]);

  useEffect(() => {
    // Redirect if no access
    if (!hasAccess) {
      Alert.alert(
        'Access Denied',
        'You do not have permission to access settings.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }

    loadPendingChanges();
  }, [hasAccess]);

  const loadPendingChanges = async () => {
    try {
      const count = await LocalStorageService.getPendingSyncCount();
      setPendingChanges(count);
    } catch (error) {
      Logger.error('Error loading pending changes', error);
    }
  };

  const handleClearDatabase = () => {
    Alert.alert(
      'Clear Local Database',
      'This will permanently delete all locally stored data including suppliers, products, rates, collections, payments, and pending sync items.\n\nThis action cannot be undone.\n\nAre you sure you want to continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Database',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsClearing(true);
              await LocalStorageService.clearAllData();
              setPendingChanges(0);
              setLastSyncMessage('');
              
              Alert.alert(
                'Success',
                'Local database has been cleared successfully.',
                [{ text: 'OK' }]
              );
            } catch (error: any) {
              Alert.alert(
                'Error',
                `Failed to clear database: ${error.message || 'Unknown error'}`,
                [{ text: 'OK' }]
              );
              Logger.error('Clear database error', error);
            } finally {
              setIsClearing(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleManualSync = async () => {
    if (!networkStatus.isConnected) {
      Alert.alert(
        'No Internet Connection',
        'You need an internet connection to sync data with the server.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsSyncing(true);
      setLastSyncMessage('Syncing...');
      
      const result = await SyncService.fullSync();
      
      if (result.success) {
        setLastSyncMessage(result.message);
        await loadPendingChanges();
        
        Alert.alert(
          'Sync Complete',
          result.message,
          [{ text: 'OK' }]
        );
      } else {
        setLastSyncMessage(`Sync failed: ${result.message}`);
        
        Alert.alert(
          'Sync Failed',
          result.message,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      setLastSyncMessage(`Sync failed: ${errorMessage}`);
      
      Alert.alert(
        'Sync Error',
        `Failed to sync data: ${errorMessage}`,
        [{ text: 'OK' }]
      );
      Logger.error('Manual sync error', error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!hasAccess) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + THEME.spacing.lg }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Database & Sync Management</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Sync Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synchronization</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Connection Status:</Text>
              <View style={styles.statusBadge}>
                <View style={[
                  styles.statusDot, 
                  { backgroundColor: networkStatus.isConnected ? THEME.colors.success : THEME.colors.error }
                ]} />
                <Text style={styles.infoValue}>
                  {networkStatus.isConnected ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pending Changes:</Text>
              <Text style={[
                styles.infoValue,
                pendingChanges > 0 && styles.infoValueWarning
              ]}>
                {pendingChanges}
              </Text>
            </View>

            {lastSyncMessage ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Sync:</Text>
                <Text style={styles.infoValueSmall}>{lastSyncMessage}</Text>
              </View>
            ) : null}
          </View>

          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.syncButton,
              (isSyncing || !networkStatus.isConnected) && styles.actionButtonDisabled
            ]}
            onPress={handleManualSync}
            disabled={isSyncing || !networkStatus.isConnected}
            accessibilityRole="button"
            accessibilityLabel="Manual sync"
            accessibilityHint="Synchronize local data with the server"
          >
            {isSyncing ? (
              <ActivityIndicator color={THEME.colors.white} />
            ) : (
              <>
                <Text style={styles.actionButtonIcon}>🔄</Text>
                <Text style={styles.actionButtonText}>Manual Sync</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.actionDescription}>
            Sync pending changes and fetch latest data from server
          </Text>
        </View>

        {/* Printer Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Printer</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.printerButton]}
            onPress={() => navigation.navigate('PrinterSettings')}
            accessibilityRole="button"
            accessibilityLabel="Printer settings"
            accessibilityHint="Configure Bluetooth thermal printer"
          >
            <Text style={styles.actionButtonIcon}>🖨️</Text>
            <Text style={styles.actionButtonText}>Printer Settings</Text>
          </TouchableOpacity>
          <Text style={styles.actionDescription}>
            Configure Bluetooth thermal printer for receipts and invoices
          </Text>
        </View>

        {/* Database Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Database Management</Text>
          
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.clearButton,
              isClearing && styles.actionButtonDisabled
            ]}
            onPress={handleClearDatabase}
            disabled={isClearing}
            accessibilityRole="button"
            accessibilityLabel="Clear database"
            accessibilityHint="Delete all locally stored data"
          >
            {isClearing ? (
              <ActivityIndicator color={THEME.colors.white} />
            ) : (
              <>
                <Text style={styles.actionButtonIcon}>🗑️</Text>
                <Text style={styles.actionButtonText}>Clear Local Database</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.actionDescriptionWarning}>
            ⚠️ This will permanently delete all local data including pending changes. Use with caution.
          </Text>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Settings screen provides operational tools for database maintenance and synchronization.
            </Text>
            <Text style={styles.infoText}>
              • Manual Sync: Push pending changes and pull latest data
            </Text>
            <Text style={styles.infoText}>
              • Clear Database: Reset local storage for troubleshooting
            </Text>
            <Text style={[styles.infoText, styles.infoTextMuted]}>
              Access restricted to Admin and Manager roles only.
            </Text>
          </View>
        </View>
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
  backButton: {
    marginBottom: THEME.spacing.base,
  },
  backButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  title: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.white,
    marginBottom: THEME.spacing.xs,
  },
  subtitle: {
    fontSize: THEME.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    padding: THEME.spacing.lg,
  },
  section: {
    marginBottom: THEME.spacing.xl,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.base,
  },
  infoCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    marginBottom: THEME.spacing.base,
    ...THEME.shadows.base,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  infoLabel: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.typography.fontWeight.medium,
  },
  infoValue: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  infoValueWarning: {
    color: THEME.colors.warning,
  },
  infoValueSmall: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textSecondary,
    flex: 1,
    textAlign: 'right',
    marginLeft: THEME.spacing.base,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: THEME.spacing.xs,
  },
  infoText: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.sm,
    lineHeight: THEME.typography.fontSize.base * 1.5,
  },
  infoTextMuted: {
    color: THEME.colors.textSecondary,
    fontStyle: 'italic',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    marginBottom: THEME.spacing.sm,
    ...THEME.shadows.base,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  syncButton: {
    backgroundColor: THEME.colors.primary,
  },
  printerButton: {
    backgroundColor: THEME.colors.info,
  },
  clearButton: {
    backgroundColor: THEME.colors.error,
  },
  actionButtonIcon: {
    fontSize: THEME.typography.fontSize.xl,
    marginRight: THEME.spacing.sm,
  },
  actionButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  actionDescription: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.base,
  },
  actionDescriptionWarning: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.error,
    textAlign: 'center',
    marginBottom: THEME.spacing.base,
  },
});
