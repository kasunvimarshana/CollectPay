// Payments Screen
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { PaymentRepository } from "../../data/repositories";
import { useSync } from "../../context";

export default function PaymentsScreen({ navigation, route }) {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isOnline, pendingChanges } = useSync();

  const supplierId = route.params?.supplierId;

  const loadPayments = useCallback(async () => {
    try {
      const filters = supplierId ? { supplier_id: supplierId } : {};
      const data = await PaymentRepository.getAll(filters);
      setPayments(data);
    } catch (error) {
      console.error("Failed to load payments:", error);
      Alert.alert("Error", "Failed to load payments");
    } finally {
      setIsLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  const getPaymentTypeColor = (type) => {
    switch (type) {
      case "full":
        return "#28a745";
      case "partial":
        return "#ffc107";
      case "advance":
        return "#17a2b8";
      default:
        return "#6c757d";
    }
  };

  const renderPayment = ({ item }) => (
    <TouchableOpacity
      style={styles.paymentCard}
      onPress={() =>
        navigation.navigate("PaymentDetail", { paymentId: item.id })
      }
    >
      <View style={styles.paymentHeader}>
        <Text style={styles.supplierName}>{item.supplier_name}</Text>
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: getPaymentTypeColor(item.payment_type) },
          ]}
        >
          <Text style={styles.typeText}>
            {item.payment_type?.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amount}>${formatCurrency(item.amount)}</Text>
        </View>

        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Date</Text>
          <Text style={styles.date}>{formatDate(item.payment_date)}</Text>
        </View>

        <View style={styles.methodContainer}>
          <Text style={styles.methodLabel}>Method</Text>
          <Text style={styles.method}>{item.payment_method || "Cash"}</Text>
        </View>
      </View>

      {item.outstanding_after !== undefined && (
        <View style={styles.outstandingContainer}>
          <Text style={styles.outstandingLabel}>Outstanding After:</Text>
          <Text
            style={[
              styles.outstandingValue,
              { color: item.outstanding_after <= 0 ? "#28a745" : "#dc3545" },
            ]}
          >
            ${formatCurrency(item.outstanding_after)}
          </Text>
        </View>
      )}

      {!item.synced && (
        <View style={styles.unsyncedBadge}>
          <Text style={styles.unsyncedText}>Pending Sync</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusBar}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: isOnline ? "#28a745" : "#dc3545" },
            ]}
          />
          <Text style={styles.statusText}>
            {isOnline ? "Online" : "Offline"}
          </Text>
          {pendingChanges > 0 && (
            <Text style={styles.pendingText}>({pendingChanges} pending)</Text>
          )}
        </View>
      </View>

      <FlatList
        data={payments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPayment}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No payments found</Text>
            </View>
          )
        }
        contentContainerStyle={payments.length === 0 ? styles.emptyList : null}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddPayment", { supplierId })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#666",
  },
  pendingText: {
    fontSize: 12,
    color: "#ffc107",
    marginLeft: 8,
  },
  paymentCard: {
    backgroundColor: "#fff",
    margin: 8,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  paymentDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  amountContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: "#666",
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  dateContainer: {
    flex: 1,
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 12,
    color: "#666",
  },
  date: {
    fontSize: 14,
    color: "#333",
  },
  methodContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  methodLabel: {
    fontSize: 12,
    color: "#666",
  },
  method: {
    fontSize: 14,
    color: "#333",
    textTransform: "capitalize",
  },
  outstandingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  outstandingLabel: {
    fontSize: 12,
    color: "#666",
  },
  outstandingValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  unsyncedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ffc107",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unsyncedText: {
    color: "#333",
    fontSize: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  emptyList: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
});
