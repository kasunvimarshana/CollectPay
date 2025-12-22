import React, { useState } from "react";
import { Alert, Button, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../nav/types";
import { addPaymentOffline } from "../db/repo";

type Props = NativeStackScreenProps<RootStackParamList, "AddPayment">;

const TYPES: Array<"advance" | "partial" | "final" | "adjustment"> = [
  "advance",
  "partial",
  "final",
  "adjustment",
];

export function AddPaymentScreen({ navigation, route }: Props) {
  const { supplierId } = route.params;

  const [type, setType] = useState<(typeof TYPES)[number]>("partial");
  const [amount, setAmount] = useState("0");
  const [paidAt, setPaidAt] = useState(new Date().toISOString());
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSave() {
    const a = Number(amount);
    if (!Number.isFinite(a) || a <= 0) {
      Alert.alert("Invalid", "Amount must be a number > 0.");
      return;
    }

    try {
      setBusy(true);
      await addPaymentOffline({
        supplier_id: supplierId,
        type,
        amount: a,
        paid_at: paidAt,
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
      <Text style={styles.label}>Paid at (ISO)</Text>
      <TextInput value={paidAt} onChangeText={setPaidAt} style={styles.input} editable={!busy} />

      <Text style={styles.label}>Amount</Text>
      <TextInput value={amount} onChangeText={setAmount} style={styles.input} keyboardType="decimal-pad" editable={!busy} />

      <Text style={styles.label}>Type</Text>
      <View style={styles.types}>
        {TYPES.map((t) => (
          <Pressable
            key={t}
            onPress={() => setType(t)}
            style={[styles.typeBtn, t === type && styles.typeBtnSelected]}
            disabled={busy}
          >
            <Text style={styles.typeText}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Notes</Text>
      <TextInput value={notes} onChangeText={setNotes} style={styles.input} editable={!busy} />

      <Button title={busy ? "Saving..." : "Save offline"} onPress={onSave} disabled={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 10 },
  label: { fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8 },
  types: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeBtn: { paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 999 },
  typeBtnSelected: { backgroundColor: "#eef" },
  typeText: { fontWeight: "600" },
});
