import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { syncOfflineOperations, showSyncResults, getSyncQueueCount } from '../utils/syncManager';

const OfflineIndicator: React.FC = () => {
  const { isConnected, isChecking } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    // Update queue count when network status changes
    updateQueueCount();
  }, [isConnected]);

  const updateQueueCount = async () => {
    const count = await getSyncQueueCount();
    setQueueCount(count);
  };

  const handleSync = async () => {
    if (!isConnected || isSyncing || queueCount === 0) return;

    setIsSyncing(true);
    try {
      await syncOfflineOperations(
        (current, total) => {
          setSyncProgress({ current, total });
        },
        (successful, failed, conflicts) => {
          setIsSyncing(false);
          setSyncProgress({ current: 0, total: 0 });
          updateQueueCount();
          showSyncResults(successful, failed, conflicts);
        }
      );
    } catch (error) {
      setIsSyncing(false);
      setSyncProgress({ current: 0, total: 0 });
      console.error('Sync error:', error);
    }
  };

  // Don't render if checking or connected with no pending operations
  if (isChecking || (isConnected && queueCount === 0)) {
    return null;
  }

  return (
    <View style={[styles.container, isConnected ? styles.containerSyncing : styles.containerOffline]}>
      {!isConnected ? (
        <>
          <View style={styles.dot} />
          <Text style={styles.text}>Offline Mode</Text>
          {queueCount > 0 && (
            <Text style={styles.queueText}>
              ({queueCount} pending)
            </Text>
          )}
        </>
      ) : queueCount > 0 && !isSyncing ? (
        <>
          <TouchableOpacity style={styles.syncButton} onPress={handleSync}>
            <Text style={styles.syncButtonText}>
              Sync {queueCount} operation(s)
            </Text>
          </TouchableOpacity>
        </>
      ) : isSyncing ? (
        <>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.text}>
            Syncing {syncProgress.current}/{syncProgress.total}...
          </Text>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  containerOffline: {
    backgroundColor: '#FF3B30',
  },
  containerSyncing: {
    backgroundColor: '#FF9500',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  queueText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
  syncButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default OfflineIndicator;
