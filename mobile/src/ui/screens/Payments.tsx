import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList } from 'react-native';
import * as Network from 'expo-network';
import * as SecureStore from 'expo-secure-store';
import { ApiClient } from '../../application/services/api';
import { CONFIG } from '../../application/config';
import { SyncManager } from '../../application/sync/SyncManager';
import { db } from '../../infrastructure/db/sqlite';
import { formatCurrency } from '../../application/utils/format';
import { subscribe, Notification } from '../../application/services/notify';
import Snackbar from '../components/Snackbar';

interface PaymentRow {
  id: string;
  supplierId: string;
  amount: number;
  currency: string;
  type: string;
  reference?: string | null;
  paidAt: string;
  synced: number;
}
interface SupplierLite { id: string; name: string }

export default function PaymentsScreen() {
  const [items, setItems] = useState<PaymentRow[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [type, setType] = useState('advance');
  const [reference, setReference] = useState('');
  const [online, setOnline] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supplierPickerOpen, setSupplierPickerOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierLite[]>([]);
  const [snack, setSnack] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({ visible: false, message: '', type: 'info' });
  const [syncing, setSyncing] = useState(false);

  const api = useMemo(
    () => new ApiClient({ baseUrl: CONFIG.apiBaseUrl, getToken: async () => await SecureStore.getItemAsync('auth_token') }),
    []
  );
  const sync = useMemo(
    () => new SyncManager(api, async () => await SecureStore.getItemAsync('auth_token')),
    [api]
  );

  const load = () => {
    db.readTransaction((tx: any) => {
      tx.executeSql(
        'SELECT * FROM payments ORDER BY paidAt DESC',
        [],
        (_: any, { rows }: any) => {
          const list: PaymentRow[] = [];
          for (let i = 0; i < rows.length; i++) {
            const r = rows.item(i);
            list.push({
              id: r.id,
              supplierId: r.supplierId,
              amount: Number(r.amount),
              currency: r.currency,
              type: r.type,
              reference: r.reference ?? null,
              paidAt: r.paidAt,
              synced: Number(r.synced ?? 0),
            });
          }
          setItems(list);
        }
      );
      tx.executeSql(
        'SELECT id, name FROM suppliers ORDER BY name ASC',
        [],
        (_: any, { rows }: any) => {
          const list: SupplierLite[] = [];
          for (let i = 0; i < rows.length; i++) {
            const r = rows.item(i);
            list.push({ id: r.id, name: r.name });
          }
          setSuppliers(list);
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
    });
    return () => unsub();
  }, []);

  const add = async () => {
    setError(null);
    if (!supplierId || !amount || Number(amount) <= 0 || !currency || !type) {
      setError('Please fill supplier, positive amount, currency, and type.');
      return;
    }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const paidAt = new Date().toISOString();
    const payload = {
      id,
      supplier_id: supplierId,
      amount: Number(amount),
      currency,
      type,
      reference: reference || null,
      paid_at: paidAt,
    };

    try {
      const created = await api.post<any>('/payments', payload);
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            'INSERT OR REPLACE INTO payments (id, supplierId, amount, currency, type, reference, paidAt, synced) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
            [
              created.id,
              created.supplier_id,
              created.amount,
              created.currency,
              created.type,
              created.reference ?? null,
              created.paid_at,
            ]
          );
        },
        console.error,
        load
      );
    } catch {
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            'INSERT INTO payments (id, supplierId, amount, currency, type, reference, paidAt, synced) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
            [id, supplierId, Number(amount), currency, type, reference || null, paidAt]
          );
        },
        console.error,
        async () => {
          await sync.enqueue('payment', payload);
          load();
        }
      );
    }

    setSupplierId('');
    setAmount('');
    setCurrency('USD');
    setType('advance');
    setReference('');
  };

  const retryItem = async (row: PaymentRow) => {
    const payload = {
      id: row.id,
      supplier_id: row.supplierId,
      amount: row.amount,
      currency: row.currency,
      type: row.type,
      reference: row.reference ?? null,
      paid_at: row.paidAt,
    };
    const ok = await sync.retrySingle('payment', payload);
    if (ok) {
      setSnack({ visible: true, message: 'Payment synced.', type: 'success' });
      load();
    } else {
      setSnack({ visible: true, message: 'Retry failed. Check connection.', type: 'error' });
    }
  };

  const clearItem = async (row: PaymentRow) => {
    await new Promise<void>((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          tx.executeSql('DELETE FROM payments WHERE id = ?', [row.id]);
        },
        reject,
        resolve
      );
    });
    await sync.removeByEntityAndPayloadId('payment', row.id);
    setSnack({ visible: true, message: 'Pending payment cleared.', type: 'info' });
    load();
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Payments</Text>
      <Text style={{ marginTop: 4, color: online ? 'green' : 'orange' }}>{online ? 'Online' : 'Offline'}</Text>
      {!!error && <Text style={{ color: 'red', marginTop: 6 }}>{error}</Text>}
      <View style={{ marginVertical: 12 }}>
        <Pressable onPress={() => setSupplierPickerOpen(!supplierPickerOpen)} style={{ borderColor: '#ddd', borderWidth: 1, padding: 8, marginBottom: 8, backgroundColor: '#fafafa' }}>
          <Text>{supplierId ? `Supplier: ${suppliers.find(s => s.id === supplierId)?.name ?? supplierId}` : 'Select Supplier'}</Text>
        </Pressable>
        {supplierPickerOpen && (
          <FlatList
            data={suppliers}
            keyExtractor={(s) => s.id}
            style={{ maxHeight: 160, borderColor: '#eee', borderWidth: 1, marginBottom: 8 }}
            renderItem={({ item }) => (
              <Pressable onPress={() => { setSupplierId(item.id); setSupplierPickerOpen(false); }} style={{ padding: 8 }}>
                <Text>{item.name}</Text>
              </Pressable>
            )}
          />
        )}
        <TextInput value={amount} onChangeText={setAmount} placeholder="Amount" keyboardType="numeric" style={{ borderColor: '#ddd', borderWidth: 1, padding: 8, marginBottom: 8 }} />
        <TextInput value={currency} onChangeText={setCurrency} placeholder="Currency" style={{ borderColor: '#ddd', borderWidth: 1, padding: 8, marginBottom: 8 }} />
        <TextInput value={type} onChangeText={setType} placeholder="Type (advance, partial)" style={{ borderColor: '#ddd', borderWidth: 1, padding: 8, marginBottom: 8 }} />
        <TextInput value={reference} onChangeText={setReference} placeholder="Reference (optional)" style={{ borderColor: '#ddd', borderWidth: 1, padding: 8 }} />
        <Pressable onPress={() => !syncing && sync.processQueue()} style={{ marginTop: 8, backgroundColor: syncing ? '#888' : '#555', padding: 8, borderRadius: 6 }}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>{syncing ? 'Syncing…' : 'Sync Now'}</Text>
        </Pressable>
        <Pressable onPress={add} style={{ marginTop: 12, backgroundColor: '#333', padding: 10, borderRadius: 6 }}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>Record Payment</Text>
        </Pressable>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text>Supplier: {suppliers.find(s => s.id === item.supplierId)?.name ?? item.supplierId}</Text>
              <Text>Amount: {formatCurrency(item.amount, item.currency)}</Text>
              <Text>Type: {item.type}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: item.synced ? '#e6ffed' : '#fff5f5' }}>
                <Text style={{ color: item.synced ? '#0366d6' : '#b00020' }}>{item.synced ? 'Synced' : 'Pending'}</Text>
              </View>
              {!item.synced && (
                <View style={{ flexDirection: 'row', marginTop: 6 }}>
                  <Pressable onPress={() => !syncing && retryItem(item)} style={{ backgroundColor: syncing ? '#88aeea' : '#0366d6', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, marginRight: 8 }}>
                    <Text style={{ color: '#fff' }}>{syncing ? 'Syncing…' : 'Retry'}</Text>
                  </Pressable>
                  <Pressable onPress={() => clearItem(item)} style={{ backgroundColor: '#b00020', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 }}>
                    <Text style={{ color: '#fff' }}>Clear</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        )}
      />
      <Snackbar visible={snack.visible} message={snack.message} type={snack.type} onDismiss={() => setSnack(s => ({ ...s, visible: false }))} />
    </View>
  );
}
