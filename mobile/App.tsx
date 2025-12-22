import React, { useEffect, useMemo, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/application/store';
import { ApiClient } from './src/application/services/api';
import { AuthService } from './src/application/services/auth';
import { SyncManager } from './src/application/sync/SyncManager';
import { CONFIG } from './src/application/config';
import { RealtimeClient } from './src/application/services/realtime';
import * as SecureStore from 'expo-secure-store';
import { initSchema, db } from './src/infrastructure/db/sqlite';
import { View, Text, TextInput, Pressable, AppState, ActivityIndicator } from 'react-native';
import * as Network from 'expo-network';
import SuppliersScreen from './src/ui/screens/Suppliers';
import CollectionsScreen from './src/ui/screens/Collections';
import PaymentsScreen from './src/ui/screens/Payments';
import SyncScreen from './src/ui/screens/Sync';
import Snackbar from './src/ui/components/Snackbar';
import { subscribe, Notification } from './src/application/services/notify';

const Stack = createNativeStackNavigator();

function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null as string | null);

  const api = useMemo(() => new ApiClient({ baseUrl: CONFIG.apiBaseUrl, getToken: async () => await SecureStore.getItemAsync('auth_token') }), []);
  const auth = useMemo(() => new AuthService(api), [api]);
  const sync = useMemo(() => new SyncManager(api, async () => await SecureStore.getItemAsync('auth_token')), [api]);

  const login = async () => {
    try {
      await auth.login(email, password);
      setError(null);
      // Run an immediate sync after login
      sync.processQueue();
      onLoggedIn();
    } catch (e: any) {
      setError(e?.message ?? 'Login failed');
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Login</Text>
      {!!error && <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text>}
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" style={{ borderWidth: 1, borderColor: '#ddd', padding: 8, marginTop: 12 }} />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry style={{ borderWidth: 1, borderColor: '#ddd', padding: 8, marginTop: 12 }} />
      <Pressable onPress={login} style={{ marginTop: 12, backgroundColor: '#333', padding: 10, borderRadius: 6 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>Login</Text>
      </Pressable>
    </View>
  );
}

// SuppliersScreen implemented in src/ui/screens/Suppliers

// CollectionsScreen and PaymentsScreen implemented in src/ui/screens

export default function App() {
  const api = useMemo(() => new ApiClient({ baseUrl: CONFIG.apiBaseUrl, getToken: async () => await SecureStore.getItemAsync('auth_token') }), []);
  const sync = useMemo(() => new SyncManager(api, async () => await SecureStore.getItemAsync('auth_token')), [api]);
  const rt = useMemo(() => new RealtimeClient(), []);
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [roles, setRoles] = useState([]);
  const [online, setOnline] = useState(true);
  const [queueCount, setQueueCount] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState(null as number | null);
  const [syncing, setSyncing] = useState(false);
  const [snack, setSnack] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    (async () => {
      await initSchema();
      const token = await SecureStore.getItemAsync('auth_token');
      const rawUser = await SecureStore.getItemAsync('auth_user');
      const parsed = rawUser ? JSON.parse(rawUser) : null;
      setRoles(parsed?.roles ?? []);
      setAuthed(!!token);
      setReady(true);
      rt.connect();
      // Kick off a background sync on startup
      sync.processQueue();
      // Sync when app becomes active and on a periodic interval
      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          sync.processQueue();
          setLastSyncedAt(Date.now());
          (async () => {
            const s = await Network.getNetworkStateAsync();
            setOnline(!!s.isConnected);
          })();
        }
      });
      const interval = setInterval(() => {
        sync.processQueue();
        setLastSyncedAt(Date.now());
        // refresh queue count periodically
        db.readTransaction((tx: any) => {
          tx.executeSql('SELECT COUNT(*) as c FROM sync_queue', [], (_: any, { rows }: any) => {
            const c = rows.item(0)?.c ?? 0;
            setQueueCount(Number(c));
          });
        });
      }, 30000);
      return () => {
        sub.remove();
        clearInterval(interval);
      };
    })();
    const unsub = subscribe((n: Notification) => {
      if (n.channel === 'queue' && n.data && typeof n.data.count === 'number') {
        setQueueCount(n.data.count);
        return;
      }
      if (n.channel === 'sync' && n.data && n.data.status) {
        const isStart = n.data.status === 'start';
        setSyncing(isStart);
        if (!isStart) {
          setLastSyncedAt(Date.now());
        }
        return;
      }
      setSnack({ visible: true, message: n.message, type: n.type });
    });
    return () => rt.disconnect();
  }, [rt, sync]);

  // Seed suppliers/products when authed and online
  useEffect(() => {
    (async () => {
      if (!authed || !online) return;
      try {
        const prods = await api.get<Array<{ id: string; name: string; unit: string }>>('/products');
        const sups = await api.get<Array<{ id: string; name: string; phone?: string | null; lat?: number | null; lng?: number | null; active: boolean }>>('/suppliers');
        let rates: Array<{ id: string; supplier_id: string; product_id: string; price_per_unit: number; currency: string; effective_from: string; effective_to?: string | null }> = [];
        try {
          rates = await api.get<typeof rates>('/rates');
        } catch {}
        await new Promise<void>((resolve, reject) => {
          db.transaction(
            (tx: any) => {
              for (const p of prods) {
                tx.executeSql(
                  'INSERT OR REPLACE INTO products (id, name, unit) VALUES (?, ?, ?)',
                  [p.id, p.name, p.unit]
                );
              }
              for (const s of sups) {
                tx.executeSql(
                  'INSERT OR REPLACE INTO suppliers (id, name, phone, lat, lng, active) VALUES (?, ?, ?, ?, ?, ?)',
                  [s.id, s.name, s.phone ?? null, s.lat ?? null, s.lng ?? null, s.active ? 1 : 0]
                );
              }
              for (const r of rates) {
                tx.executeSql(
                  'INSERT OR REPLACE INTO rates (id, supplierId, productId, pricePerUnit, currency, effectiveFrom, effectiveTo) VALUES (?, ?, ?, ?, ?, ?, ?)',
                  [r.id, r.supplier_id, r.product_id, r.price_per_unit, r.currency, r.effective_from, r.effective_to ?? null]
                );
              }
            },
            reject,
            resolve
          );
        });
      } catch {
        // ignore seeding errors
      }
    })();
  }, [authed, online, api]);

  // Initial queue count and on focus
  useEffect(() => {
    db.readTransaction((tx: any) => {
      tx.executeSql('SELECT COUNT(*) as c FROM sync_queue', [], (_: any, { rows }: any) => {
        const c = rows.item(0)?.c ?? 0;
        setQueueCount(Number(c));
      });
    });
  }, []);

  const triggerSync = async () => {
    if (syncing || !online) return;
    setSyncing(true);
    try {
      await sync.processQueue();
      setLastSyncedAt(Date.now());
      db.readTransaction((tx: any) => {
        tx.executeSql('SELECT COUNT(*) as c FROM sync_queue', [], (_: any, { rows }: any) => {
          const c = rows.item(0)?.c ?? 0;
          setQueueCount(Number(c));
        });
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        {!ready ? (
          <View style={{ padding: 16 }}><Text>Loading…</Text></View>
        ) : (
          <>
            {syncing && (
              <View style={{ backgroundColor: '#e7f5ff', padding: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="small" color="#1c7ed6" style={{ marginRight: 8 }} />
                <Text style={{ color: '#1c7ed6', textAlign: 'center' }}>Syncing — processing queued items</Text>
              </View>
            )}
            {!online && (
              <View style={{ backgroundColor: '#fff4e5', padding: 8 }}>
                <Text style={{ color: '#b4690e', textAlign: 'center' }}>Offline — actions will be queued</Text>
              </View>
            )}
            <View style={{ backgroundColor: '#f6f8fa', padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#555' }}>Queued: {queueCount}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {lastSyncedAt && (
                  <Text style={{ color: '#777', marginRight: 12 }}>Last Sync: {new Date(lastSyncedAt).toLocaleTimeString()}</Text>
                )}
                <Pressable onPress={triggerSync} style={{ backgroundColor: syncing || !online ? '#888' : '#333', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}>
                  <Text style={{ color: '#fff' }}>{syncing ? 'Syncing…' : (!online ? 'Offline' : 'Sync Now')}</Text>
                </Pressable>
              </View>
            </View>
            <NavigationContainer>
              <Stack.Navigator>
              {!authed ? (
                <Stack.Screen name="Login" children={() => <LoginScreen onLoggedIn={() => setAuthed(true)} />} />
              ) : (
                <>
                  <Stack.Screen name="Sync" component={SyncScreen} />
                  {(roles.includes('manager') || roles.includes('admin')) && (
                    <Stack.Screen name="Suppliers" component={SuppliersScreen} />
                  )}
                  {(roles.includes('collector') || roles.includes('manager') || roles.includes('admin')) && (
                    <Stack.Screen name="Collections" component={CollectionsScreen} />
                  )}
                  {(roles.includes('cashier') || roles.includes('manager') || roles.includes('admin')) && (
                    <Stack.Screen name="Payments" component={PaymentsScreen} />
                  )}
                </>
              )}
              </Stack.Navigator>
            </NavigationContainer>
          </>
        )}
        <Snackbar visible={snack.visible} message={snack.message} type={snack.type} onDismiss={() => setSnack(s => ({ ...s, visible: false }))} />
      </PersistGate>
    </Provider>
  );
}
