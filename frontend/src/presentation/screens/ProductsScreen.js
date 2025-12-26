// Products Screen
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { ProductRepository, RateRepository } from "../../data/repositories";
import { useSync, useAuth } from "../../context";

export default function ProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [currentRates, setCurrentRates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    unit: "kg",
    category: "",
  });

  const { isOnline, pendingChanges } = useSync();
  const { hasRole } = useAuth();

  const canManageProducts = hasRole("admin") || hasRole("manager");

  const loadProducts = useCallback(async () => {
    try {
      const filters = searchQuery ? { search: searchQuery } : {};
      const data = await ProductRepository.getAll(filters);
      const rates = await RateRepository.getCurrentRates();
      setProducts(data);
      setCurrentRates(rates);
    } catch (error) {
      console.error("Failed to load products:", error);
      Alert.alert("Error", "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const getCurrentRate = (productId) => {
    const rate = currentRates.find((r) => r.product_id === productId);
    return rate?.current_rate;
  };

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) {
      Alert.alert("Error", "Product name is required");
      return;
    }

    try {
      await ProductRepository.create(newProduct);
      setShowAddModal(false);
      setNewProduct({ name: "", unit: "kg", category: "" });
      loadProducts();
      Alert.alert("Success", "Product created successfully");
    } catch (error) {
      console.error("Failed to create product:", error);
      Alert.alert("Error", "Failed to create product");
    }
  };

  const renderProduct = ({ item }) => {
    const rate = getCurrentRate(item.id);

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate("Rates", { productId: item.id })}
      >
        <View style={styles.productHeader}>
          <View>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productCode}>{item.code}</Text>
          </View>
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
        </View>

        <View style={styles.productDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Unit</Text>
            <Text style={styles.detailValue}>{item.unit}</Text>
          </View>

          {item.category && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{item.category}</Text>
            </View>
          )}

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Current Rate</Text>
            <Text style={[styles.detailValue, styles.rateValue]}>
              {rate ? `$${rate.toFixed(2)}/${item.unit}` : "Not set"}
            </Text>
          </View>
        </View>

        {!item.synced && (
          <View style={styles.unsyncedBadge}>
            <Text style={styles.unsyncedText}>Pending Sync</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

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

        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={loadProducts}
        />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          )
        }
        contentContainerStyle={products.length === 0 ? styles.emptyList : null}
      />

      {canManageProducts && (
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
            <Text style={styles.modalTitle}>Add New Product</Text>

            <TextInput
              style={styles.input}
              placeholder="Product Name *"
              value={newProduct.name}
              onChangeText={(text) =>
                setNewProduct({ ...newProduct, name: text })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Unit (e.g., kg, liters)"
              value={newProduct.unit}
              onChangeText={(text) =>
                setNewProduct({ ...newProduct, unit: text })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Category"
              value={newProduct.category}
              onChangeText={(text) =>
                setNewProduct({ ...newProduct, category: text })
              }
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
                onPress={handleAddProduct}
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
    marginBottom: 8,
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
  searchInput: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  productCard: {
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
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  productCode: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  productDetails: {
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
  rateValue: {
    fontWeight: "bold",
    color: "#007AFF",
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
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
