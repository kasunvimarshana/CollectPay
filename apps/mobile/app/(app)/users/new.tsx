import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useUserStore } from '@/state/userStore';
import { useAuthStore } from '@/state/authStore';
import { can } from '@/security/accessControl';

export default function NewUser() {
  const { createUser } = useUserStore();
  const me = useAuthStore(s => s.user);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');

  const onCreate = async () => {
    try {
      await createUser({ name, email, role });
      Alert.alert('Created');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Unknown');
    }
  };

  if (!can(me, 'user:create')) {
    return (
      <View style={styles.container}><Text>Not authorized</Text></View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize='none' />
      <Text style={styles.label}>Role</Text>
      <TextInput style={styles.input} value={role} onChangeText={setRole} />
      <Button title="Create" onPress={onCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontWeight: '600', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginTop: 4 }
});
