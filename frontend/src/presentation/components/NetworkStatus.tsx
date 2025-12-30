/**
 * Network Status Component
 * Displays current network and sync status
 * Following Clean Architecture - Presentation Layer
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSyncStore } from '../state/useSyncStore';

export const NetworkStatus: React.FC = () => {
  const { networkState, isSyncing, pendingOperations, sync, initialize } = useSyncStore();
  const [queueSize, setQueueSize] = React.useState(0);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    setQueueSize(pendingOperations.length);
  }, [pendingOperations]);

  const handleSync = () => {
    sync().catch(console.error);
  };

  const isOnline = networkState.isConnected();
  const connectionType = networkState.getConnectionType();

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={[styles.indicator, isOnline ? styles.online : styles.offline]} />
        <Text style={styles.statusText}>
          {isOnline ? `Online (${connectionType})` : 'Offline'}
        </Text>
      </View>

      {queueSize > 0 && (
        <View style={styles.queueInfo}>
          <Text style={styles.queueText}>
            {queueSize} pending operation{queueSize !== 1 ? 's' : ''}
          </Text>
          {isOnline && !isSyncing && (
            <TouchableOpacity onPress={handleSync} style={styles.syncButton}>
              <Text style={styles.syncButtonText}>Sync Now</Text>
            </TouchableOpacity>
          )}
          {isSyncing && (
            <Text style={styles.syncingText}>Syncing...</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    padding: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  queueInfo: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  queueText: {
    fontSize: 12,
    color: '#666',
  },
  syncButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  syncButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  syncingText: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
  },
});
