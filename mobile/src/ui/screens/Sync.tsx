import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import * as Network from 'expo-network';
import * as SecureStore from 'expo-secure-store';
import { db } from '../../infrastructure/db/sqlite';
import { ApiClient } from '../../application/services/api';
import { SyncManager } from '../../application/sync/SyncManager';
import { CONFIG } from '../../application/config';
import Snackbar from '../components/Snackbar';
import { subscribe, Notification } from '../../application/services/notify';

interface QueueItem {
  id: string;
  entity: string;
  payload: string;
  createdAt: number;
}

export default function SyncScreen() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [snack, setSnack] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({ visible: false, message: '', type: 'info' });
  const api = useMemo(() => new ApiClient({ baseUrl: CONFIG.apiBaseUrl, getToken: async () => await SecureStore.getItemAsync('auth_token') }), []);
  const sync = useMemo(() => new SyncManager(api, async () => await SecureStore.getItemAsync('auth_token')), [api]);

  const load = () => {
    db.readTransaction((tx: any) => {
      tx.executeSql(
        'SELECT id, entity, payload, createdAt FROM sync_queue ORDER BY createdAt DESC',
        [],
        (_: any, { rows }: any) => {
          const list: QueueItem[] = [];
          for (let i = 0; i < rows.length; i++) {
            const r = rows.item(i);
            list.push({ id: r.id, entity: r.entity, payload: r.payload, createdAt: Number(r.createdAt) });
          }
          setItems(list);
        }
      );
    });
  };

  useEffect(() => {
    load();
    (async () => {
      const s = await Network.getNetworkStateAsync();
      setOnline(!!s.isConnected);
    })();
    const unsub = subscribe((n: Notification) => {
      if (n.channel === 'queue') {
        load();
        return;
      }
      if (n.channel === 'sync' && n.data && n.data.status) {
        setSyncing(n.data.status === 'start');
        return;
      }
      setSnack({ visible: true, message: n.message, type: n.type });
    });
    return () => unsub();
  }, []);

  const remove = async (id: string) => {
    db.transaction((tx: any) => {
      tx.executeSql('DELETE FROM sync_queue WHERE id = ?', [id]);
    }, console.error, load);
  };

  const clearAll = async () => {
    db.transaction((tx: any) => {
      tx.executeSql('DELETE FROM sync_queue');
    }, console.error, load);
    setSnack({ visible: true, message: 'Cleared all queued items.', type: 'info' });
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Sync Queue</Text>
      <Text style={{ marginTop: 4, color: online ? 'green' : 'orange' }}>{online ? 'Online' : 'Offline'}</Text>
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <Pressable onPress={() => !syncing && sync.processQueue()} style={{ backgroundColor: syncing ? '#888' : '#333', padding: 10, borderRadius: 6, marginRight: 8 }}>
          <Text style={{ color: '#fff' }}>{syncing ? 'Syncing…' : 'Retry All'}</Text>
        </Pressable>
        <Pressable onPress={clearAll} style={{ backgroundColor: '#b00020', padding: 10, borderRadius: 6 }}>
          <Text style={{ color: '#fff' }}>Clear All</Text>
        </Pressable>
      </View>
      <FlatList
        style={{ marginTop: 12 }}
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexShrink: 1, paddingRight: 8 }}>
              <Text style={{ fontWeight: '600' }}>{item.entity}</Text>
              <Text style={{ color: '#666' }}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
            <Pressable onPress={() => remove(item.id)} style={{ backgroundColor: '#999', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}>
              <Text style={{ color: '#fff' }}>Remove</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={{ marginTop: 12, color: '#666' }}>Queue is empty</Text>}
      />
      <Snackbar visible={snack.visible} message={snack.message} type={snack.type} onDismiss={() => setSnack(s => ({ ...s, visible: false }))} />
    </View>
  );
}
