import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../nav/types";
import { Supplier, createSupplierOffline, listSuppliers } from "../db/repo";
import { countConflicts, countOutbox } from "../db/outbox";
import { getMeta } from "../db/db";
import { syncOnce } from "../sync/sync";
import { useAuth } from "../auth/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "Suppliers">;

export function SuppliersScreen({ navigation }: Props) {
  const { signOut } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState({ outbox: 0, conflicts: 0, cursor: 0 });

  async function refresh() {
    const s = await listSuppliers();
    setSuppliers(s);
    const outbox = await countOutbox();
    const conflicts = await countConflicts();
    const cursorStr = await getMeta("cursor");
    setStats({ outbox, conflicts, cursor: cursorStr ? Number(cursorStr) : 0 });
  }

  useEffect(() => {
    refresh();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [])
  );

  async function onAddSupplier() {
    if (!name.trim()) return;
    try {
      setBusy(true);
      await createSupplierOffline({ name: name.trim(), phone: phone.trim() || undefined });
      setName("");
      setPhone("");
      await refresh();
    } catch (e: any) {
      Alert.alert("Failed", e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onSync() {
    try {
      setBusy(true);
      const res = await syncOnce({
        pushLimit: 100,
        conflictStrategy: "server_wins",
      });
      await refresh();
      Alert.alert("Sync", `Pushed ${res.pushed}, pulled ${res.pulled}. Outbox ${stats.outbox}→${await countOutbox()}`);
    } catch (e: any) {
      Alert.alert("Sync failed", e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onSignOut() {
    try {
      setBusy(true);
      await signOut();
    } catch (e: any) {
      Alert.alert("Failed", e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Button title={busy ? "Working..." : "Sync now"} onPress={onSync} disabled={busy} />
        <Button
          title={stats.conflicts > 0 ? `Conflicts (${stats.conflicts})` : "Conflicts"}
          onPress={() => navigation.navigate("Conflicts")}
          disabled={busy}
        />
        <Button title="Sign out" onPress={onSignOut} disabled={busy} />
        <Text style={styles.meta}>Outbox: {stats.outbox}  Conflicts: {stats.conflicts}  Cursor: {stats.cursor}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add supplier (offline)</Text>
        <TextInput
          placeholder="Supplier name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          editable={!busy}
        />
        <TextInput
          placeholder="Phone (optional)"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          editable={!busy}
        />
        <Button title="Add" onPress={onAddSupplier} disabled={busy || !name.trim()} />
      </View>

      <FlatList
        data={suppliers}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.item}
            onPress={() => navigation.navigate("Supplier", { supplierId: item.id })}
          >
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text style={styles.itemSub}>{item.phone ?? ""}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 12 },
  row: { gap: 8 },
  meta: { color: "#666" },
  card: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, gap: 8 },
  cardTitle: { fontSize: 14, fontWeight: "700" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8 },
  item: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  itemTitle: { fontSize: 16, fontWeight: "600" },
  itemSub: { color: "#666" },
});
