import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList } from 'react-native';
import * as Network from 'expo-network';
import * as SecureStore from 'expo-secure-store';
import { ApiClient } from '../../application/services/api';
import { CONFIG } from '../../application/config';
import { SyncManager } from '../../application/sync/SyncManager';
import { db } from '../../infrastructure/db/sqlite';
import { formatCurrency, formatNumber } from '../../application/utils/format';
import { subscribe, Notification } from '../../application/services/notify';
import Snackbar from '../components/Snackbar';

interface CollectionRow {
  id: string;
  supplierId: string;
  productId: string;
  quantity: number;
  unit: string;
  notes?: string | null;
  collectedAt: string;
  synced: number;
  payableAmount?: number;
  payableCurrency?: string;
}

interface SupplierLite { id: string; name: string }
interface ProductLite { id: string; name: string }

export default function CollectionsScreen() {
  const [items, setItems] = useState<CollectionRow[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [notes, setNotes] = useState('');
  const [online, setOnline] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supplierPickerOpen, setSupplierPickerOpen] = useState(false);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierLite[]>([]);
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [rateMap, setRateMap] = useState<Record<string, { price: number; currency: string }>>({});
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
        'SELECT * FROM collections ORDER BY collectedAt DESC',
        [],
        (_: any, { rows }: any) => {
          const list: CollectionRow[] = [];
          for (let i = 0; i < rows.length; i++) {
            const r = rows.item(i);
            const key = `${r.supplierId}|${r.productId}`;
            const rm = rateMap[key];
            const payableAmount = rm ? Number(r.quantity) * rm.price : undefined;
            list.push({
              id: r.id,
              supplierId: r.supplierId,
              productId: r.productId,
              quantity: Number(r.quantity),
              unit: r.unit,
              notes: r.notes ?? null,
              collectedAt: r.collectedAt,
              synced: Number(r.synced ?? 0),
              payableAmount,
              payableCurrency: rm?.currency,
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
      tx.executeSql(
        'SELECT id, name FROM products ORDER BY name ASC',
        [],
        (_: any, { rows }: any) => {
          const list: ProductLite[] = [];
          for (let i = 0; i < rows.length; i++) {
            const r = rows.item(i);
            list.push({ id: r.id, name: r.name });
          }
          setProducts(list);
        }
      );
      // Build a latest-rate map by supplier/product
      tx.executeSql(
        'SELECT supplierId, productId, pricePerUnit, currency, effectiveFrom FROM rates ORDER BY effectiveFrom DESC',
        [],
        (_: any, { rows }: any) => {
          const m: Record<string, { price: number; currency: string }> = {};
          for (let i = 0; i < rows.length; i++) {
            const r = rows.item(i);
            const key = `${r.supplierId}|${r.productId}`;
            if (!m[key]) {
              m[key] = { price: Number(r.pricePerUnit), currency: r.currency };
            }
          }
          setRateMap(m);
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
    // basic validation
    if (!supplierId || !productId || !quantity || Number(quantity) <= 0 || !unit) {
      setError('Please fill supplier, product, positive quantity, and unit.');
      return;
    }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const collectedAt = new Date().toISOString();
    const payload = {
      id,
      supplier_id: supplierId,
      product_id: productId,
      quantity: Number(quantity),
      unit,
      notes: notes || null,
      collected_at: collectedAt,
    };

    // Try online create first
    try {
      const created = await api.post<any>('/collections', payload);
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            'INSERT OR REPLACE INTO collections (id, supplierId, productId, quantity, unit, collectedAt, notes, synced) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
            [
              created.id,
              created.supplier_id,
              created.product_id,
              created.quantity,
              created.unit,
              created.collected_at,
              created.notes ?? null,
            ]
          );
        },
        console.error,
        load
      );
    } catch {
      // Fall back to local insert and enqueue for sync
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            'INSERT INTO collections (id, supplierId, productId, quantity, unit, collectedAt, notes, synced) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
            [id, supplierId, productId, Number(quantity), unit, collectedAt, notes || null]
          );
        },
        console.error,
        async () => {
          await sync.enqueue('collection', payload);
          load();
        }
      );
    }

    // Reset form
    setSupplierId('');
    setProductId('');
    setQuantity('');
    setUnit('kg');
    setNotes('');
  };

  const retryItem = async (row: CollectionRow) => {
    const payload = {
      id: row.id,
      supplier_id: row.supplierId,
      product_id: row.productId,
      quantity: row.quantity,
      unit: row.unit,
      notes: row.notes ?? null,
      collected_at: row.collectedAt,
    };
    const ok = await sync.retrySingle('collection', payload);
    if (ok) {
      setSnack({ visible: true, message: 'Collection synced.', type: 'success' });
      load();
    } else {
      setSnack({ visible: true, message: 'Retry failed. Check connection.', type: 'error' });
    }
  };

  const clearItem = async (row: CollectionRow) => {
    await new Promise<void>((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          tx.executeSql('DELETE FROM collections WHERE id = ?', [row.id]);
        },
        reject,
        resolve
      );
    });
    await sync.removeByEntityAndPayloadId('collection', row.id);
    setSnack({ visible: true, message: 'Pending collection cleared.', type: 'info' });
    load();
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Collections</Text>
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
        <Pressable onPress={() => setProductPickerOpen(!productPickerOpen)} style={{ borderColor: '#ddd', borderWidth: 1, padding: 8, marginBottom: 8, backgroundColor: '#fafafa' }}>
          <Text>{productId ? `Product: ${products.find(p => p.id === productId)?.name ?? productId}` : 'Select Product'}</Text>
        </Pressable>
        {productPickerOpen && (
          <FlatList
            data={products}
            keyExtractor={(p) => p.id}
            style={{ maxHeight: 160, borderColor: '#eee', borderWidth: 1, marginBottom: 8 }}
            renderItem={({ item }) => (
              <Pressable onPress={() => { setProductId(item.id); setProductPickerOpen(false); }} style={{ padding: 8 }}>
                <Text>{item.name}</Text>
              </Pressable>
            )}
          />
        )}
        <TextInput value={quantity} onChangeText={setQuantity} placeholder="Quantity" keyboardType="numeric" style={{ borderColor: '#ddd', borderWidth: 1, padding: 8, marginBottom: 8 }} />
        <TextInput value={unit} onChangeText={setUnit} placeholder="Unit (kg, l, etc.)" style={{ borderColor: '#ddd', borderWidth: 1, padding: 8, marginBottom: 8 }} />
        <TextInput value={notes} onChangeText={setNotes} placeholder="Notes (optional)" style={{ borderColor: '#ddd', borderWidth: 1, padding: 8 }} />
        <Pressable onPress={() => !syncing && sync.processQueue()} style={{ marginTop: 8, backgroundColor: syncing ? '#888' : '#555', padding: 8, borderRadius: 6 }}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>{syncing ? 'Syncing…' : 'Sync Now'}</Text>
        </Pressable>
        <Pressable onPress={add} style={{ marginTop: 12, backgroundColor: '#333', padding: 10, borderRadius: 6 }}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>Record Collection</Text>
        </Pressable>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text>Supplier: {suppliers.find(s => s.id === item.supplierId)?.name ?? item.supplierId}</Text>
              <Text>Product: {products.find(p => p.id === item.productId)?.name ?? item.productId}</Text>
              <Text>Qty: {formatNumber(item.quantity, 3)} {item.unit}</Text>
              {item.payableAmount != null && item.payableCurrency && (
                <Text>Payable: {formatCurrency(item.payableAmount, item.payableCurrency)}</Text>
              )}
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
