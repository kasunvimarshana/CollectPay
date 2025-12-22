import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useUserStore } from '@/state/userStore';
import { useAuthStore } from '@/state/authStore';
import { isOnline } from '@/utils/net';
import { can } from '@/security/accessControl';

export default function UsersList() {
  const { users, loadUsers } = useUserStore();
  const me = useAuthStore(s => s.user);
  const [refreshing, setRefreshing] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    loadUsers();
    isOnline().then(setOnline);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers(true);
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Users</Text>
        {can(me, 'user:create') && (
          <Link href="/(app)/users/new" asChild>
            <TouchableOpacity style={styles.primaryBtn}><Text style={styles.btnText}>New</Text></TouchableOpacity>
          </Link>
        )}
      </View>
      <Text style={styles.badge}>{online ? 'Online' : 'Offline'}</Text>
      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Link href={`/(app)/users/${item.id}`} asChild>
            <TouchableOpacity style={styles.row}>
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
            </TouchableOpacity>
          </Link>
        )}
        ListEmptyComponent={<Text style={{ padding: 16 }}>No users yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: '600' },
  row: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  name: { fontSize: 16, fontWeight: '500' },
  email: { color: '#666' },
  primaryBtn: { backgroundColor: '#2c7be5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnText: { color: 'white', fontWeight: '600' },
  badge: { marginLeft: 16, marginBottom: 8, color: '#666' }
});
