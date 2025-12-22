import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import SyncService, { SyncConflict } from '../services/sync';
import { format } from 'date-fns';

const MAX_SYNC_HISTORY = 10;

const SyncScreen = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncHistory, setSyncHistory] = useState<{
    timestamp: string;
    created: number;
    updated: number;
    conflicts: number;
  }[]>([]);

  useEffect(() => {
    loadLastSyncTime();
  }, []);

  const loadLastSyncTime = async () => {
    const syncTime = await SyncService.getLastSyncTime();
    setLastSync(syncTime);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await SyncService.syncAll();
      
      if (result.success) {
        const timestamp = new Date().toISOString();
        const newEntry = {
          timestamp,
          created: result.created || 0,
          updated: result.updated || 0,
          conflicts: result.conflicts?.length || 0,
        };
        
        setSyncHistory([newEntry, ...syncHistory.slice(0, MAX_SYNC_HISTORY - 1)]);
        await loadLastSyncTime();

        if (result.conflicts && result.conflicts.length > 0) {
          showConflictDetails(result.conflicts);
        } else {
          Alert.alert(
            'Sync Successful',
            `Created: ${result.created || 0}\nUpdated: ${result.updated || 0}`
          );
        }
      } else {
        Alert.alert('Sync Failed', result.error || 'Unknown error');
      }
    } catch (error: any) {
      Alert.alert('Sync Error', error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const showConflictDetails = (conflicts: SyncConflict[]) => {
    const collectionConflicts = conflicts.filter(c => c.type === 'collection').length;
    const paymentConflicts = conflicts.filter(c => c.type === 'payment').length;
    
    Alert.alert(
      'Sync Complete with Conflicts',
      `${conflicts.length} conflict(s) detected:\n\n` +
      `Collections: ${collectionConflicts}\n` +
      `Payments: ${paymentConflicts}\n\n` +
      'Server version was used for all conflicting records.',
      [{ text: 'OK' }]
    );
  };

  const formatSyncTime = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    try {
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync Status</Text>
        <View style={styles.statusCard}>
          <Text style={styles.label}>Last Sync:</Text>
          <Text style={styles.value}>{formatSyncTime(lastSync)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
          onPress={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.syncButtonText}>Sync Now</Text>
          )}
        </TouchableOpacity>
      </View>

      {syncHistory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sync History</Text>
          {syncHistory.map((entry, index) => (
            <View key={index} style={styles.historyCard}>
              <Text style={styles.historyTime}>
                {formatSyncTime(entry.timestamp)}
              </Text>
              <View style={styles.historyStats}>
                <Text style={styles.historyStat}>Created: {entry.created}</Text>
                <Text style={styles.historyStat}>Updated: {entry.updated}</Text>
                {entry.conflicts > 0 && (
                  <Text style={[styles.historyStat, styles.conflictText]}>
                    Conflicts: {entry.conflicts}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.infoTitle}>About Sync</Text>
        <Text style={styles.infoText}>
          • Sync uploads your local changes to the server{'\n'}
          • Downloads updates from other users{'\n'}
          • Resolves conflicts automatically{'\n'}
          • Server version wins in case of conflicts{'\n'}
          • Works only when connected to the internet
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  syncButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  syncButtonDisabled: {
    backgroundColor: '#999',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyTime: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  historyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  historyStat: {
    fontSize: 12,
    color: '#666',
  },
  conflictText: {
    color: '#FF9500',
    fontWeight: '600',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});

export default SyncScreen;
