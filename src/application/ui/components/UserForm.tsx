import React, { useEffect, useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
import type { User } from "../../../domain/models/User";

export function UserForm({ initial, onSave, onCancel }: {
  initial?: User;
  onSave: (user: User) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");

  useEffect(() => {
    setName(initial?.name ?? "");
    setEmail(initial?.email ?? "");
  }, [initial]);

  return (
    <View style={styles.container}>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
      <Button title="Save" onPress={() => onSave({ id: initial?.id ?? crypto.randomUUID(), name, email, updatedAt: Date.now(), deviceId: "local" })} />
      <View style={{ height: 12 }} />
      <Button title="Cancel" color="#666" onPress={onCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10, marginBottom: 12 },
});
