import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNetworkStore } from '../store/networkStore';
import { syncManager } from '../services/syncManager';

interface SyncStatusProps {
  onSyncPress?: () => void;
  showManualSync?: boolean;
}

export default function SyncStatus({ onSyncPress, showManualSync = true }: SyncStatusProps) {
  const { isConnected, connectionType } = useNetworkStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    // Update sync status periodically
    const interval = setInterval(() => {
      const status = syncManager.getSyncStatus();
      setIsSyncing(status.isSyncing);
      setLastSync(status.lastSyncTime);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    if (isSyncing || !isConnected) return;
    
    if (onSyncPress) {
      onSyncPress();
    } else {
      setIsSyncing(true);
      await syncManager.forceSyncNow();
      setIsSyncing(false);
    }
  };

  const getLastSyncText = () => {
    if (!lastSync) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <MaterialIcons
          name={isConnected ? 'wifi' : 'wifi-off'}
          size={20}
          color={isConnected ? '#27ae60' : '#e74c3c'}
        />
        <Text style={[styles.statusText, isConnected ? styles.online : styles.offline]}>
          {isConnected ? `Online (${connectionType})` : 'Offline'}
        </Text>
      </View>

      <View style={styles.statusRow}>
        {isSyncing ? (
          <>
            <ActivityIndicator size="small" color="#3498db" />
            <Text style={styles.statusText}>Syncing...</Text>
          </>
        ) : (
          <>
            <MaterialIcons
              name={lastSync ? 'check-circle' : 'sync-disabled'}
              size={20}
              color={lastSync ? '#27ae60' : '#95a5a6'}
            />
            <Text style={styles.statusText}>Last sync: {getLastSyncText()}</Text>
          </>
        )}
      </View>

      {showManualSync && (
        <TouchableOpacity
          style={[
            styles.syncButton,
            (!isConnected || isSyncing) && styles.syncButtonDisabled,
          ]}
          onPress={handleManualSync}
          disabled={!isConnected || isSyncing}
        >
          <MaterialIcons
            name="sync"
            size={20}
            color="white"
          />
          <Text style={styles.syncButtonText}>
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#2c3e50',
  },
  online: {
    color: '#27ae60',
    fontWeight: '600',
  },
  offline: {
    color: '#e74c3c',
    fontWeight: '600',
  },
  syncButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
  },
  syncButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  syncButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
});
