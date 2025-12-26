import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSync } from '../hooks/useSync';

export function SyncStatusBar() {
  const { syncState, triggerSync, isSyncing } = useSync();

  const getStatusColor = () => {
    switch (syncState.status) {
      case 'syncing':
        return '#FFA500';
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = () => {
    switch (syncState.status) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return 'Synced';
      case 'error':
        return 'Sync failed';
      default:
        return 'Not synced';
    }
  };

  const formatLastSync = () => {
    if (!syncState.lastSyncTime) {
      return 'Never synced';
    }
    const date = new Date(syncState.lastSyncTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffMinutes / 1440)}d ago`;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusInfo}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
        <Text style={styles.lastSyncText}>• {formatLastSync()}</Text>
        {syncState.pendingCount > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>{syncState.pendingCount}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
        onPress={triggerSync}
        disabled={isSyncing}
      >
        {isSyncing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.syncButtonText}>Sync</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  lastSyncText: {
    fontSize: 12,
    color: '#666',
  },
  pendingBadge: {
    backgroundColor: '#FF5722',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  pendingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  syncButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    backgroundColor: '#BBDEFB',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
