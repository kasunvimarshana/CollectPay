// Supplier Detail Screen
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import {
  SupplierRepository,
  CollectionRepository,
  PaymentRepository,
} from "../../data/repositories";
import { useSync, useAuth } from "../../context";

export default function SupplierDetailScreen({ navigation, route }) {
  const [supplier, setSupplier] = useState(null);
  const [recentCollections, setRecentCollections] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [outstandingBalance, setOutstandingBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { isOnline, pendingChanges } = useSync();
  const { hasPermission } = useAuth();

  const supplierId = route.params?.supplierId;

  const loadSupplierData = useCallback(async () => {
    if (!supplierId) return;

    try {
      const supplierData = await SupplierRepository.getById(supplierId);
      const collections = await CollectionRepository.getAll({
        supplier_id: supplierId,
      });
      const payments = await PaymentRepository.getAll({
        supplier_id: supplierId,
      });
      const balance = await PaymentRepository.getOutstandingBalance(supplierId);

      setSupplier(supplierData);
      setRecentCollections(collections.slice(0, 5));
      setRecentPayments(payments.slice(0, 5));
      setOutstandingBalance(balance);
    } catch (error) {
      console.error("Failed to load supplier data:", error);
      Alert.alert("Error", "Failed to load supplier details");
    } finally {
      setIsLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    loadSupplierData();
  }, [loadSupplierData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSupplierData();
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

  if (!supplier && !isLoading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Supplier not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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

      {supplier && (
        <>
          {/* Supplier Info Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.supplierName}>{supplier.name}</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: supplier.is_active ? "#28a745" : "#dc3545",
                  },
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {supplier.is_active ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Code:</Text>
              <Text style={styles.infoValue}>{supplier.code}</Text>
            </View>

            {supplier.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>{supplier.phone}</Text>
              </View>
            )}

            {supplier.email && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{supplier.email}</Text>
              </View>
            )}

            {supplier.address && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>{supplier.address}</Text>
              </View>
            )}

            {!supplier.synced && (
              <View style={styles.unsyncedBadge}>
                <Text style={styles.unsyncedText}>Pending Sync</Text>
              </View>
            )}
          </View>

          {/* Outstanding Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Outstanding Balance</Text>
            <Text
              style={[
                styles.balanceValue,
                { color: outstandingBalance <= 0 ? "#28a745" : "#dc3545" },
              ]}
            >
              ${formatCurrency(outstandingBalance)}
            </Text>
            {outstandingBalance <= 0 && (
              <Text style={styles.balanceNote}>
                All payments are up to date
              </Text>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryAction]}
              onPress={() =>
                navigation.navigate("AddCollection", { supplierId })
              }
            >
              <Text style={styles.actionButtonText}>Add Collection</Text>
            </TouchableOpacity>

            {hasPermission("payments.create") && (
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryAction]}
                onPress={() =>
                  navigation.navigate("AddPayment", { supplierId })
                }
              >
                <Text style={styles.secondaryActionText}>Record Payment</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Recent Collections */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Collections</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Collections", { supplierId })
                }
              >
                <Text style={styles.viewAllLink}>View All</Text>
              </TouchableOpacity>
            </View>

            {recentCollections.length > 0 ? (
              recentCollections.map((collection) => (
                <View key={collection.id} style={styles.listItem}>
                  <View style={styles.listItemLeft}>
                    <Text style={styles.listItemTitle}>
                      {collection.product_name}
                    </Text>
                    <Text style={styles.listItemSubtitle}>
                      {formatDate(collection.collection_date)}
                    </Text>
                  </View>
                  <View style={styles.listItemRight}>
                    <Text style={styles.listItemValue}>
                      {collection.quantity} {collection.unit}
                    </Text>
                    <Text style={styles.listItemAmount}>
                      ${formatCurrency(collection.total_value)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyListText}>No collections yet</Text>
            )}
          </View>

          {/* Recent Payments */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Payments</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Payments", { supplierId })}
              >
                <Text style={styles.viewAllLink}>View All</Text>
              </TouchableOpacity>
            </View>

            {recentPayments.length > 0 ? (
              recentPayments.map((payment) => (
                <View key={payment.id} style={styles.listItem}>
                  <View style={styles.listItemLeft}>
                    <Text style={styles.listItemTitle}>
                      {payment.payment_method}
                    </Text>
                    <Text style={styles.listItemSubtitle}>
                      {formatDate(payment.payment_date)}
                    </Text>
                  </View>
                  <View style={styles.listItemRight}>
                    <Text style={styles.listItemAmount}>
                      ${formatCurrency(payment.amount)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyListText}>No payments yet</Text>
            )}
          </View>
        </>
      )}
    </ScrollView>
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
  card: {
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  supplierName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    width: 80,
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  unsyncedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ffc107",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  unsyncedText: {
    color: "#333",
    fontSize: 10,
  },
  balanceCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: "bold",
  },
  balanceNote: {
    fontSize: 12,
    color: "#28a745",
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  primaryAction: {
    backgroundColor: "#007AFF",
  },
  secondaryAction: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryActionText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  viewAllLink: {
    fontSize: 14,
    color: "#007AFF",
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  listItemLeft: {
    flex: 1,
  },
  listItemRight: {
    alignItems: "flex-end",
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  listItemSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  listItemValue: {
    fontSize: 14,
    color: "#333",
  },
  listItemAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007AFF",
    marginTop: 2,
  },
  emptyListText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
