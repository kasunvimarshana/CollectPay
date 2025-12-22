import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList } from 'react-native';
import { ApiClient } from '../../application/services/api';
import { CONFIG } from '../../application/config';
import * as SecureStore from 'expo-secure-store';
import { db } from '../../infrastructure/db/sqlite';
import { SyncManager } from '../../application/sync/SyncManager';
import { subscribe, Notification } from '../../application/services/notify';

interface SupplierRow { id: string; name: string }

export default function SuppliersScreen() {
  const [items, setItems] = useState([] as SupplierRow[]);
  const [name, setName] = useState('');
  const api = useMemo(() => new ApiClient({ baseUrl: CONFIG.apiBaseUrl, getToken: async () => await SecureStore.getItemAsync('auth_token') }), []);
  const sync = useMemo(() => new SyncManager(api, async () => await SecureStore.getItemAsync('auth_token')), [api]);

  const load = () => {
    db.readTransaction((tx: any) => {
      tx.executeSql('SELECT id, name FROM suppliers ORDER BY name ASC', [], (_: any, { rows }: any) => {
        const list: SupplierRow[] = [];
        for (let i = 0; i < rows.length; i++) {
          const r = rows.item(i);
          list.push({ id: r.id, name: r.name });
        }
        setItems(list);
      });
    });
  };

  useEffect(() => {
    load();
    const unsub = subscribe((n: Notification) => {
      if (n.channel === 'queue') {
        load();
      }
    });
    return () => unsub();
  }, []);

  const add = async () => {
    // Try online create, fall back to local-only
    try {
      const created = await api.post<any>('/suppliers', { name, active: true });
      db.transaction((tx: any) => {
        tx.executeSql('INSERT OR REPLACE INTO suppliers (id, name, active) VALUES (?, ?, 1)', [created.id, created.name]);
      }, console.error, load);
    } catch {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      db.transaction((tx: any) => {
        tx.executeSql('INSERT INTO suppliers (id, name, active) VALUES (?, ?, 1)', [id, name]);
      }, console.error, async () => {
        await sync.enqueue('supplier', { id, name, active: true });
        load();
      });
    }
    setName('');
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Suppliers</Text>
      <View style={{ flexDirection: 'row', marginVertical: 12 }}>
        <TextInput value={name} onChangeText={setName} placeholder="Supplier name" style={{ flex: 1, borderColor: '#ddd', borderWidth: 1, padding: 8, marginRight: 8 }} />
        <Pressable onPress={add} style={{ backgroundColor: '#333', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6 }}>
          <Text style={{ color: '#fff' }}>Add</Text>
        </Pressable>
      </View>
      <FlatList data={items} keyExtractor={(s: any) => s.id} renderItem={({ item }: any) => (
        <View style={{ paddingVertical: 8 }}>
          <Text>{item.name}</Text>
        </View>
      )} />
    </View>
  );
}
