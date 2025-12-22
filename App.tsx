import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import { StoreProvider, useStore, createUser, updateUser, deleteUser } from './src/application/state/Store';
import { UserList } from './src/application/ui/components/UserList';
import { UserForm } from './src/application/ui/components/UserForm';
import type { User } from './src/domain/models/User';

function UsersScreen() {
  const { state, dispatch } = useStore();
  const [editing, setEditing] = useState<User | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  const onSave = async (user: User) => {
    if (editing) {
      await updateUser(user);
      dispatch({ type: 'update', user });
    } else {
      await createUser(user);
      dispatch({ type: 'create', user });
    }
    setEditing(undefined);
    setShowForm(false);
  };

  const onDelete = async (user: User) => {
    await deleteUser(user.id);
    dispatch({ type: 'delete', id: user.id });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Users</Text>
        <Button title="Add" onPress={() => { setEditing(undefined); setShowForm(true); }} />
      </View>
      {showForm ? (
        <UserForm initial={editing} onSave={onSave} onCancel={() => { setEditing(undefined); setShowForm(false); }} />
      ) : (
        <UserList users={state.users} onEdit={(u) => { setEditing(u); setShowForm(true); }} onDelete={onDelete} />
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <UsersScreen />
    </StoreProvider>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 20, fontWeight: '700' },
});
