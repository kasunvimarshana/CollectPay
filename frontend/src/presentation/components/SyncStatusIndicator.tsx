/**
 * SyncStatusIndicator Component
 * Displays current sync status and allows manual sync
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '../../application/hooks/useNetworkStatus';
import { COLORS } from '../../core/constants/colors';

interface SyncStatusIndicatorProps {
  showDetails?: boolean;
  onSyncComplete?: (success: boolean) => void;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  showDetails = false,
  onSyncComplete,
}) => {
  const {
    networkStatus,
    syncStatus,
    sync,
    getSyncStatusMessage,
    getStatusIcon,
  } = useNetworkStatus();

  const handleSync = async () => {
    const result = await sync();
    onSyncComplete?.(result.success);
  };

  const getStatusColor = (): string => {
    if (syncStatus.syncError) return COLORS.error;
    if (!networkStatus.canSync) return COLORS.warning;
    if (syncStatus.hasPendingChanges) return COLORS.info;
    return COLORS.success;
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        {/* Status Icon */}
        {syncStatus.isSyncing ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons
            name={getStatusIcon()}
            size={20}
            color={getStatusColor()}
          />
        )}

        {/* Status Text */}
        {showDetails && (
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getSyncStatusMessage()}
          </Text>
        )}

        {/* Manual Sync Button */}
        {networkStatus.canSync && !syncStatus.isSyncing && (
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleSync}
            disabled={syncStatus.isSyncing}
          >
            <Ionicons name="refresh" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Network Status Badge */}
      {!networkStatus.canSync && (
        <View style={styles.offlineBadge}>
          <Text style={styles.offlineText}>Offline</Text>
        </View>
      )}

      {/* Pending Changes Count */}
      {syncStatus.hasPendingChanges && showDetails && (
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>Changes pending sync</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  syncButton: {
    padding: 4,
  },
  offlineBadge: {
    backgroundColor: COLORS.warning,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: COLORS.info,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
  },
  pendingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
