import React, { useCallback, useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../nav/types";
import {
  CollectionEntry,
  Payment,
  Supplier,
  getSupplier,
  listCollectionsForSupplier,
  listPaymentsForSupplier,
} from "../db/repo";

type Props = NativeStackScreenProps<RootStackParamList, "Supplier">;

export function SupplierScreen({ navigation, route }: Props) {
  const { supplierId } = route.params;
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [collections, setCollections] = useState<CollectionEntry[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  async function refresh() {
    const s = await getSupplier(supplierId);
    setSupplier(s);
    setCollections(await listCollectionsForSupplier(supplierId));
    setPayments(await listPaymentsForSupplier(supplierId));
  }

  useEffect(() => {
    refresh();
  }, [supplierId]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [supplierId])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{supplier?.name ?? "Supplier"}</Text>
        <View style={styles.actions}>
          <Button
            title="Add collection"
            onPress={() => navigation.navigate("AddCollection", { supplierId })}
          />
          <Button
            title="Add payment"
            onPress={() => navigation.navigate("AddPayment", { supplierId })}
          />
        </View>
      </View>

      <Text style={styles.section}>Collections</Text>
      <FlatList
        data={collections}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{item.collected_at}</Text>
            <Text>
              qty: {item.quantity} (base {item.quantity_in_base})
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No collections yet</Text>}
      />

      <Text style={styles.section}>Payments</Text>
      <FlatList
        data={payments}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{item.paid_at}</Text>
            <Text>
              {item.type}: {item.amount}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No payments yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 10 },
  header: { gap: 8 },
  title: { fontSize: 18, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 10 },
  section: { marginTop: 8, fontSize: 14, fontWeight: "700" },
  row: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee", gap: 4 },
  empty: { color: "#666", paddingVertical: 8 },
});
