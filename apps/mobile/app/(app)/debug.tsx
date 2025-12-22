import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { outbox, syncState } from '@/services/repository';
import { syncOnce } from '@/services/sync';

export default function DebugScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [token, setToken] = useState<string | undefined>();

  const load = async () => {
    const all = await outbox.listAll();
    const t = await syncState.getToken();
    setItems(all);
    setToken(t);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sync Token</Text>
      <Text selectable style={styles.code}>{token ?? '(none)'}</Text>
      <View style={styles.row}>
        <Button title="Force Sync" onPress={async () => { await syncOnce(); await load(); }} />
        <View style={{ width: 12 }} />
        <Button title="Clear Outbox" color="#d9534f" onPress={async () => { await outbox.clearAll(); await load(); }} />
      </View>
      <Text style={styles.heading}>Outbox</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.code}>{JSON.stringify(item)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ padding: 8 }}>Outbox empty</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontWeight: '700', marginTop: 8, marginBottom: 4 },
  code: { fontFamily: 'monospace' as any },
  item: { padding: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  row: { flexDirection: 'row', marginVertical: 12 }
});
