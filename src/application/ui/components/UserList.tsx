import React from "react";
import { FlatList, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { User } from "../../../domain/models/User";

export function UserList({ users, onEdit, onDelete }: {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}) {
  return (
    <FlatList
      data={users}
      keyExtractor={(u) => u.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>
          <TouchableOpacity onPress={() => onEdit(item)} style={styles.btn}><Text>Edit</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item)} style={[styles.btn, styles.del]}><Text>Delete</Text></TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
  name: { fontSize: 16, fontWeight: "600" },
  email: { fontSize: 13, color: "#555" },
  btn: { padding: 8, backgroundColor: "#ddd", borderRadius: 6, marginLeft: 8 },
  del: { backgroundColor: "#fdd" },
});
