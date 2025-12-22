import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useUserStore } from '@/state/userStore';
import { useAuthStore } from '@/state/authStore';
import { can } from '@/security/accessControl';

export default function UserDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById, updateUser, deleteUser } = useUserStore();
  const me = useAuthStore(s => s.user);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');

  useEffect(() => {
    const u = getById(id!);
    if (u) {
      setName(u.name);
      setEmail(u.email);
      setRole(u.role);
    }
  }, [id]);

  const onSave = async () => {
    try {
      await updateUser({ id: id!, name, email, role });
      Alert.alert('Saved');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Unknown');
    }
  };

  const onDelete = async () => {
    try {
      await deleteUser(id!);
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Unknown');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize='none' />
      <Text style={styles.label}>Role</Text>
      <TextInput style={styles.input} value={role} onChangeText={setRole} />

      {can(me, 'user:update', { ownerEmail: email }) && (
        <Button title="Save" onPress={onSave} />
      )}
      {can(me, 'user:delete', { ownerEmail: email }) && (
        <View style={{ marginTop: 12 }}>
          <Button title="Delete" color="#d9534f" onPress={onDelete} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontWeight: '600', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginTop: 4 }
});
