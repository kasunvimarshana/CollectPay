// Rates Screen
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { RateRepository, ProductRepository } from "../../data/repositories";
import { useSync, useAuth } from "../../context";

export default function RatesScreen({ navigation, route }) {
  const [rates, setRates] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRate, setNewRate] = useState({
    product_id: null,
    rate: "",
    effective_from: new Date().toISOString().split("T")[0],
    applied_scope: "general",
    notes: "",
  });

  const { isOnline, pendingChanges } = useSync();
  const { hasRole } = useAuth();

  const productId = route.params?.productId;
  const canManageRates = hasRole("admin") || hasRole("manager");

  const loadRates = useCallback(async () => {
    try {
      const filters = productId ? { product_id: productId } : {};
      const data = await RateRepository.getAll(filters);
      const productList = await ProductRepository.getActiveProducts();
      setRates(data);
      setProducts(productList);

      if (productId) {
        setNewRate((prev) => ({ ...prev, product_id: productId }));
      }
    } catch (error) {
      console.error("Failed to load rates:", error);
      Alert.alert("Error", "Failed to load rates");
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRates();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isCurrentRate = (rate) => {
    const today = new Date().toISOString().split("T")[0];
    return (
      rate.effective_from <= today &&
      (!rate.effective_to || rate.effective_to >= today) &&
      rate.is_active
    );
  };

  const handleAddRate = async () => {
    if (!newRate.product_id) {
      Alert.alert("Error", "Please select a product");
      return;
    }
    if (!newRate.rate || parseFloat(newRate.rate) <= 0) {
      Alert.alert("Error", "Please enter a valid rate");
      return;
    }

    try {
      await RateRepository.create({
        ...newRate,
        rate: parseFloat(newRate.rate),
      });
      setShowAddModal(false);
      setNewRate({
        product_id: productId || null,
        rate: "",
        effective_from: new Date().toISOString().split("T")[0],
        applied_scope: "general",
        notes: "",
      });
      loadRates();
      Alert.alert("Success", "Rate created successfully");
    } catch (error) {
      console.error("Failed to create rate:", error);
      Alert.alert("Error", "Failed to create rate");
    }
  };

  const renderRate = ({ item }) => {
    const isCurrent = isCurrentRate(item);

    return (
      <View style={[styles.rateCard, isCurrent && styles.currentRateCard]}>
        {isCurrent && (
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>CURRENT</Text>
          </View>
        )}

        <View style={styles.rateHeader}>
          <Text style={styles.productName}>{item.product_name}</Text>
          <Text style={styles.rateValue}>
            ${parseFloat(item.rate).toFixed(2)}/{item.product_unit}
          </Text>
        </View>

        <View style={styles.rateDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Effective From</Text>
            <Text style={styles.detailValue}>
              {formatDate(item.effective_from)}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Effective To</Text>
            <Text style={styles.detailValue}>
              {item.effective_to ? formatDate(item.effective_to) : "Ongoing"}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Scope</Text>
            <Text style={styles.detailValue}>
              {item.applied_scope === "general"
                ? "General"
                : item.supplier_name || "Specific"}
            </Text>
          </View>
        </View>

        {item.notes && <Text style={styles.notes}>{item.notes}</Text>}

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: item.is_active ? "#28a745" : "#dc3545" },
          ]}
        >
          <Text style={styles.statusText}>
            {item.is_active ? "Active" : "Inactive"}
          </Text>
        </View>

        {!item.synced && (
          <View style={styles.unsyncedBadge}>
            <Text style={styles.unsyncedText}>Pending Sync</Text>
          </View>
        )}
      </View>
    );
  };

  const renderProductPicker = () => (
    <View style={styles.pickerContainer}>
      <Text style={styles.inputLabel}>Product *</Text>
      <View style={styles.pickerOptions}>
        {products.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={[
              styles.pickerOption,
              newRate.product_id === product.id && styles.pickerOptionSelected,
            ]}
            onPress={() => setNewRate({ ...newRate, product_id: product.id })}
          >
            <Text
              style={[
                styles.pickerOptionText,
                newRate.product_id === product.id &&
                  styles.pickerOptionTextSelected,
              ]}
            >
              {product.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
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
          <Text style={styles.statusBarText}>
            {isOnline ? "Online" : "Offline"}
          </Text>
          {pendingChanges > 0 && (
            <Text style={styles.pendingText}>({pendingChanges} pending)</Text>
          )}
        </View>
      </View>

      <FlatList
        data={rates}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRate}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No rates found</Text>
            </View>
          )
        }
        contentContainerStyle={rates.length === 0 ? styles.emptyList : null}
      />

      {canManageRates && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Rate</Text>

            {!productId && renderProductPicker()}

            <Text style={styles.inputLabel}>Rate *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={newRate.rate}
              onChangeText={(text) => setNewRate({ ...newRate, rate: text })}
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>Effective From</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={newRate.effective_from}
              onChangeText={(text) =>
                setNewRate({ ...newRate, effective_from: text })
              }
            />

            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Optional notes"
              value={newRate.notes}
              onChangeText={(text) => setNewRate({ ...newRate, notes: text })}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddRate}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  statusBarText: {
    fontSize: 12,
    color: "#666",
  },
  pendingText: {
    fontSize: 12,
    color: "#ffc107",
    marginLeft: 8,
  },
  rateCard: {
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
  currentRateCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  currentBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#007AFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  currentBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  rateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  rateValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  rateDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detailItem: {
    marginRight: 24,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
  },
  notes: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  statusBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  unsyncedBadge: {
    position: "absolute",
    top: 8,
    left: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  pickerContainer: {
    marginBottom: 12,
  },
  pickerOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  pickerOption: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  pickerOptionSelected: {
    backgroundColor: "#007AFF",
  },
  pickerOptionText: {
    color: "#333",
    fontSize: 14,
  },
  pickerOptionTextSelected: {
    color: "#fff",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
