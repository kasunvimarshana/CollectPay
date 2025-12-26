// Add Collection Screen
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  CollectionRepository,
  SupplierRepository,
  ProductRepository,
  RateRepository,
} from "../../data/repositories";
import { useSync, useAuth } from "../../context";

export default function AddCollectionScreen({ navigation, route }) {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    supplier_id: route.params?.supplierId || null,
    product_id: null,
    quantity: "",
    collection_date: new Date().toISOString().split("T")[0],
    notes: "",
    location_latitude: null,
    location_longitude: null,
  });

  const [selectedRate, setSelectedRate] = useState(null);
  const [calculatedValue, setCalculatedValue] = useState(0);

  const { isOnline, syncNow } = useSync();
  const { user } = useAuth();

  const loadData = useCallback(async () => {
    try {
      const [supplierList, productList] = await Promise.all([
        SupplierRepository.getActiveSuppliers(),
        ProductRepository.getActiveProducts(),
      ]);
      setSuppliers(supplierList);
      setProducts(productList);
    } catch (error) {
      console.error("Failed to load data:", error);
      Alert.alert("Error", "Failed to load form data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    // Load applicable rate when product and supplier are selected
    const loadRate = async () => {
      if (formData.product_id && formData.supplier_id) {
        try {
          const rate = await RateRepository.getApplicableRate(
            formData.product_id,
            formData.supplier_id,
            formData.collection_date
          );
          setSelectedRate(rate);
          calculateValue(formData.quantity, rate);
        } catch (error) {
          console.error("Failed to load rate:", error);
          setSelectedRate(null);
        }
      }
    };
    loadRate();
  }, [formData.product_id, formData.supplier_id, formData.collection_date]);

  const calculateValue = (quantity, rate) => {
    if (quantity && rate) {
      const qty = parseFloat(quantity) || 0;
      const rateValue = parseFloat(rate.rate) || 0;
      setCalculatedValue(qty * rateValue);
    } else {
      setCalculatedValue(0);
    }
  };

  const handleQuantityChange = (value) => {
    setFormData({ ...formData, quantity: value });
    calculateValue(value, selectedRate);
  };

  const validateForm = () => {
    if (!formData.supplier_id) {
      Alert.alert("Validation Error", "Please select a supplier");
      return false;
    }
    if (!formData.product_id) {
      Alert.alert("Validation Error", "Please select a product");
      return false;
    }
    const qty = parseFloat(formData.quantity);
    if (!qty || qty <= 0) {
      Alert.alert("Validation Error", "Please enter a valid quantity");
      return false;
    }
    if (!selectedRate) {
      Alert.alert(
        "Validation Error",
        "No rate found for this product. Please contact an administrator."
      );
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const collectionData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        rate_id: selectedRate.id,
        rate_applied: selectedRate.rate,
        total_value: calculatedValue,
        collected_by: user?.id,
      };

      await CollectionRepository.create(collectionData);

      Alert.alert("Success", "Collection recorded successfully", [
        {
          text: "OK",
          onPress: () => {
            if (isOnline) {
              syncNow();
            }
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to save collection:", error);
      Alert.alert("Error", "Failed to save collection");
    } finally {
      setIsSaving(false);
    }
  };

  const renderSupplierPicker = () => (
    <View style={styles.pickerSection}>
      <Text style={styles.label}>Supplier *</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pickerScroll}
      >
        {suppliers.map((supplier) => (
          <TouchableOpacity
            key={supplier.id}
            style={[
              styles.pickerItem,
              formData.supplier_id === supplier.id && styles.pickerItemSelected,
            ]}
            onPress={() =>
              setFormData({ ...formData, supplier_id: supplier.id })
            }
          >
            <Text
              style={[
                styles.pickerItemText,
                formData.supplier_id === supplier.id &&
                  styles.pickerItemTextSelected,
              ]}
            >
              {supplier.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderProductPicker = () => (
    <View style={styles.pickerSection}>
      <Text style={styles.label}>Product *</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pickerScroll}
      >
        {products.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={[
              styles.pickerItem,
              formData.product_id === product.id && styles.pickerItemSelected,
            ]}
            onPress={() => setFormData({ ...formData, product_id: product.id })}
          >
            <Text
              style={[
                styles.pickerItemText,
                formData.product_id === product.id &&
                  styles.pickerItemTextSelected,
              ]}
            >
              {product.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const selectedProduct = products.find((p) => p.id === formData.product_id);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.scrollContainer}>
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
          </View>
        </View>

        <View style={styles.form}>
          {renderSupplierPicker()}
          {renderProductPicker()}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Quantity * {selectedProduct ? `(${selectedProduct.unit})` : ""}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.quantity}
              onChangeText={handleQuantityChange}
              placeholder="Enter quantity"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Collection Date</Text>
            <TextInput
              style={styles.input}
              value={formData.collection_date}
              onChangeText={(value) =>
                setFormData({ ...formData, collection_date: value })
              }
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(value) =>
                setFormData({ ...formData, notes: value })
              }
              placeholder="Optional notes"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Rate and Value Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Collection Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Rate:</Text>
              <Text style={styles.summaryValue}>
                {selectedRate
                  ? `$${parseFloat(selectedRate.rate).toFixed(2)}/${
                      selectedProduct?.unit || "unit"
                    }`
                  : "Select product and supplier"}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Quantity:</Text>
              <Text style={styles.summaryValue}>
                {formData.quantity
                  ? `${formData.quantity} ${selectedProduct?.unit || ""}`
                  : "-"}
              </Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Value:</Text>
              <Text style={styles.totalValue}>
                ${calculatedValue.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isSaving}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? "Saving..." : "Save Collection"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flex: 1,
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
  form: {
    padding: 16,
  },
  pickerSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  pickerScroll: {
    flexGrow: 0,
  },
  pickerItem: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  pickerItemSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  pickerItemText: {
    fontSize: 14,
    color: "#333",
  },
  pickerItemTextSelected: {
    color: "#fff",
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 2,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#007AFF",
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
