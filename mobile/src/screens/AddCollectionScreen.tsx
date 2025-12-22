import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../nav/types";
import { Product, Unit, addCollectionOffline, listProducts, listUnits } from "../db/repo";

type Props = NativeStackScreenProps<RootStackParamList, "AddCollection">;

export function AddCollectionScreen({ navigation, route }: Props) {
  const { supplierId } = route.params;

  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [productId, setProductId] = useState<string | null>(null);
  const [unitId, setUnitId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [collectedAt, setCollectedAt] = useState(new Date().toISOString());
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      setProducts(await listProducts());
      setUnits(await listUnits());
    })();
  }, []);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === productId) ?? null,
    [products, productId]
  );
  const filteredUnits = useMemo(() => {
    if (!selectedProduct) return units;
    return units.filter((u) => u.unit_type === selectedProduct.unit_type);
  }, [units, selectedProduct]);

  async function onSave() {
    if (!productId || !unitId) {
      Alert.alert("Missing", "Select product and unit.");
      return;
    }

    const q = Number(quantity);
    if (!Number.isFinite(q) || q <= 0) {
      Alert.alert("Invalid", "Quantity must be a number > 0.");
      return;
    }

    try {
      setBusy(true);
      await addCollectionOffline({
        supplier_id: supplierId,
        product_id: productId,
        unit_id: unitId,
        quantity: q,
        collected_at: collectedAt,
        notes: notes.trim() || undefined,
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Failed", e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Collected at (ISO)</Text>
      <TextInput value={collectedAt} onChangeText={setCollectedAt} style={styles.input} editable={!busy} />

      <Text style={styles.label}>Quantity</Text>
      <TextInput value={quantity} onChangeText={setQuantity} style={styles.input} keyboardType="decimal-pad" editable={!busy} />

      <Text style={styles.label}>Notes</Text>
      <TextInput value={notes} onChangeText={setNotes} style={styles.input} editable={!busy} />

      <Text style={styles.section}>Product</Text>
      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        style={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.pickItem, item.id === productId && styles.pickItemSelected]}
            onPress={() => setProductId(item.id)}
          >
            <Text style={styles.pickTitle}>{item.name}</Text>
            <Text style={styles.pickSub}>{item.unit_type}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No products locally. Sync first.</Text>}
      />

      <Text style={styles.section}>Unit</Text>
      <FlatList
        data={filteredUnits}
        keyExtractor={(u) => u.id}
        style={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.pickItem, item.id === unitId && styles.pickItemSelected]}
            onPress={() => setUnitId(item.id)}
          >
            <Text style={styles.pickTitle}>{item.code}</Text>
            <Text style={styles.pickSub}>{item.name}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No units locally. Sync first.</Text>}
      />

      <Button title={busy ? "Saving..." : "Save offline"} onPress={onSave} disabled={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 10 },
  label: { fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8 },
  section: { marginTop: 8, fontWeight: "700" },
  list: { maxHeight: 160, borderWidth: 1, borderColor: "#eee", borderRadius: 8 },
  pickItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  pickItemSelected: { backgroundColor: "#eef" },
  pickTitle: { fontWeight: "600" },
  pickSub: { color: "#666" },
  empty: { color: "#666", padding: 10 },
});
