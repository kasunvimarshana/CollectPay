import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card, CardContent, Badge, SyncStatusBadge } from '../../src/components/ui';
import { useAuth, useSync } from '../../src/hooks';
import { colors, spacing, typography, shadows } from '../../src/theme';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { 
    isSyncing, 
    pendingChangesCount, 
    lastSyncTimestamp, 
    hasConflicts,
    conflicts,
    sync 
  } = useSync();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleForceSync = async () => {
    if (isSyncing) return;
    await sync();
    Alert.alert('Sync Complete', 'Data has been synchronized with the server.');
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Never';
    return date.toLocaleString('en-LK', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Profile Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        <Card style={styles.card}>
          <CardContent>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                <Text style={styles.profileEmail}>{user?.email || ''}</Text>
              </View>
              <Badge
                label={user?.role?.toUpperCase() || 'USER'}
                variant="primary"
              />
            </View>
          </CardContent>
        </Card>

        {/* Sync Section */}
        <Text style={styles.sectionTitle}>Synchronization</Text>
        <Card style={styles.card}>
          <CardContent>
            <View style={styles.syncRow}>
              <View>
                <Text style={styles.settingLabel}>Sync Status</Text>
                <Text style={styles.settingDescription}>
                  Last sync: {formatDate(lastSyncTimestamp)}
                </Text>
              </View>
              <SyncStatusBadge status={isSyncing ? 'Syncing...' : 'Synced'} />
            </View>

            <View style={styles.divider} />

            <View style={styles.syncRow}>
              <View>
                <Text style={styles.settingLabel}>Pending Changes</Text>
                <Text style={styles.settingDescription}>
                  Changes waiting to upload
                </Text>
              </View>
              <Badge
                label={pendingChangesCount.toString()}
                variant={pendingChangesCount > 0 ? 'warning' : 'success'}
              />
            </View>

            {hasConflicts && (
              <>
                <View style={styles.divider} />
                <View style={styles.syncRow}>
                  <View>
                    <Text style={styles.settingLabel}>Conflicts</Text>
                    <Text style={styles.settingDescription}>
                      {conflicts.length} conflicts need resolution
                    </Text>
                  </View>
                  <Badge label={conflicts.length.toString()} variant="error" />
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
              onPress={handleForceSync}
              disabled={isSyncing}
            >
              <Text style={styles.syncButtonText}>
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Text>
            </TouchableOpacity>
          </CardContent>
        </Card>

        {/* App Info */}
        <Text style={styles.sectionTitle}>About</Text>
        <Card style={styles.card}>
          <CardContent>
            <SettingRow label="App Version" value="1.0.0" />
            <View style={styles.divider} />
            <SettingRow label="Build" value="2024.01.001" />
            <View style={styles.divider} />
            <SettingRow label="API Server" value="Production" />
          </CardContent>
        </Card>

        {/* Support */}
        <Text style={styles.sectionTitle}>Support</Text>
        <Card style={styles.card}>
          <CardContent>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>📖</Text>
              <Text style={styles.menuLabel}>User Guide</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>📧</Text>
              <Text style={styles.menuLabel}>Contact Support</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>📋</Text>
              <Text style={styles.menuLabel}>Terms of Service</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>🔒</Text>
              <Text style={styles.menuLabel}>Privacy Policy</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          © 2024 FieldSync. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const SettingRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingLabel}>{label}</Text>
    <Text style={styles.settingValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    marginLeft: spacing.xs,
  },
  card: {
    marginBottom: spacing.sm,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  profileEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  settingLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  settingDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  settingValue: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.sm,
  },
  syncButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  syncButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  menuArrow: {
    fontSize: typography.fontSize.xl,
    color: colors.text.secondary,
  },
  logoutButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.error.light,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error.dark,
  },
  footer: {
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.lg,
  },
});
