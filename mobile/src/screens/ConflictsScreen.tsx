import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../nav/types";
import {
  ConflictRow,
  deleteConflict,
  enqueueOp,
  listConflicts,
} from "../db/outbox";
import { syncOnce } from "../sync/sync";

type Props = NativeStackScreenProps<RootStackParamList, "Conflicts">;

export function ConflictsScreen({ navigation }: Props) {
  const [rows, setRows] = useState<ConflictRow[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function refresh() {
    const r = await listConflicts(200);
    setRows(r);
  }

  useEffect(() => {
    refresh();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [])
  );

  async function onKeepServer(conflictId: number) {
    try {
      setBusyId(conflictId);
      await deleteConflict(conflictId);
      await refresh();
    } catch (e: any) {
      Alert.alert("Failed", e?.message ?? String(e));
    } finally {
      setBusyId(null);
    }
  }

  async function onRetryClientWins(row: ConflictRow) {
    try {
      setBusyId(row.id);
      const payload = row.client ?? {};
      const opType = row.op_type ?? "upsert";
      const clientUpdatedAt = row.client_updated_at ?? new Date().toISOString();

      await enqueueOp({
        entity: row.entity,
        type: opType,
        id: row.entity_id,
        base_version: row.base_version ?? null,
        payload,
        client_updated_at: clientUpdatedAt,
      });

      await deleteConflict(row.id);
      await refresh();

      try {
        const res = await syncOnce({ pushLimit: 100, conflictStrategy: "client_wins" });
        await refresh();
        Alert.alert(
          "Retried",
          `Pushed ${res.pushed}, pulled ${res.pulled}. Conflicts remaining: ${res.conflicts}.`
        );
      } catch {
        Alert.alert(
          "Queued",
          "Re-queued operation, but sync failed. You can sync later when online."
        );
      }
    } catch (e: any) {
      Alert.alert("Failed", e?.message ?? String(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Conflicts</Text>
        <Text style={styles.sub}>{rows.length} pending</Text>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(r) => String(r.id)}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => {
          const disabled = busyId === item.id;
          return (
            <View style={styles.card}>
              <Text style={styles.entity}>
                {item.entity} · {item.op_type ?? "upsert"}
              </Text>
              <Text style={styles.meta}>ID: {item.entity_id}</Text>
              <Text style={styles.reason}>Reason: {item.reason}</Text>

              <View style={styles.buttons}>
                <Button
                  title={disabled ? "Working..." : "Keep server"}
                  onPress={() => onKeepServer(item.id)}
                  disabled={disabled}
                />
                <Button
                  title={disabled ? "Working..." : "Retry (client wins)"}
                  onPress={() => onRetryClientWins(item)}
                  disabled={disabled}
                />
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No conflicts.</Text>
            <Button title="Back to suppliers" onPress={() => navigation.goBack()} />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  header: { marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "700" },
  sub: { color: "#666" },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  entity: { fontSize: 14, fontWeight: "700" },
  meta: { color: "#666" },
  reason: { color: "#333" },
  buttons: { gap: 8, marginTop: 8 },
  empty: { paddingVertical: 24, gap: 12, alignItems: "flex-start" },
  emptyText: { color: "#666" },
});
