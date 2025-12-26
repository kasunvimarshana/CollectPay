// Add Payment Screen
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
import { PaymentRepository, SupplierRepository } from "../../data/repositories";
import { useSync, useAuth } from "../../context";

const PAYMENT_METHODS = [
  { id: "cash", label: "Cash" },
  { id: "bank_transfer", label: "Bank Transfer" },
  { id: "check", label: "Check" },
  { id: "mobile_money", label: "Mobile Money" },
];

const PAYMENT_TYPES = [
  { id: "full", label: "Full Payment", color: "#28a745" },
  { id: "partial", label: "Partial Payment", color: "#ffc107" },
  { id: "advance", label: "Advance Payment", color: "#17a2b8" },
];

export default function AddPaymentScreen({ navigation, route }) {
  const [suppliers, setSuppliers] = useState([]);
  const [outstandingBalance, setOutstandingBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    supplier_id: route.params?.supplierId || null,
    amount: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "cash",
    payment_type: "partial",
    reference_number: "",
    notes: "",
  });

  const { isOnline, syncNow } = useSync();
  const { user, hasPermission } = useAuth();

  const loadData = useCallback(async () => {
    try {
      const supplierList = await SupplierRepository.getActiveSuppliers();
      setSuppliers(supplierList);

      if (formData.supplier_id) {
        const balance = await PaymentRepository.getOutstandingBalance(
          formData.supplier_id
        );
        setOutstandingBalance(balance);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      Alert.alert("Error", "Failed to load form data");
    } finally {
      setIsLoading(false);
    }
  }, [formData.supplier_id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    // Update outstanding balance when supplier changes
    const updateBalance = async () => {
      if (formData.supplier_id) {
        try {
          const balance = await PaymentRepository.getOutstandingBalance(
            formData.supplier_id
          );
          setOutstandingBalance(balance);
        } catch (error) {
          console.error("Failed to get balance:", error);
        }
      }
    };
    updateBalance();
  }, [formData.supplier_id]);

  const handleAmountChange = (value) => {
    setFormData({ ...formData, amount: value });

    // Auto-detect payment type based on amount
    const amount = parseFloat(value) || 0;
    if (amount > 0 && outstandingBalance > 0) {
      if (amount >= outstandingBalance) {
        setFormData((prev) => ({
          ...prev,
          amount: value,
          payment_type: "full",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          amount: value,
          payment_type: "partial",
        }));
      }
    } else if (amount > 0 && outstandingBalance <= 0) {
      setFormData((prev) => ({
        ...prev,
        amount: value,
        payment_type: "advance",
      }));
    }
  };

  const setFullPaymentAmount = () => {
    if (outstandingBalance > 0) {
      setFormData({
        ...formData,
        amount: outstandingBalance.toFixed(2),
        payment_type: "full",
      });
    }
  };

  const validateForm = () => {
    if (!formData.supplier_id) {
      Alert.alert("Validation Error", "Please select a supplier");
      return false;
    }
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      Alert.alert("Validation Error", "Please enter a valid amount");
      return false;
    }
    if (!formData.payment_method) {
      Alert.alert("Validation Error", "Please select a payment method");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount),
        recorded_by: user?.id,
        outstanding_before: outstandingBalance,
        outstanding_after: outstandingBalance - parseFloat(formData.amount),
      };

      await PaymentRepository.create(paymentData);

      Alert.alert("Success", "Payment recorded successfully", [
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
      console.error("Failed to save payment:", error);
      Alert.alert("Error", error.message || "Failed to save payment");
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

  const renderPaymentMethodPicker = () => (
    <View style={styles.pickerSection}>
      <Text style={styles.label}>Payment Method *</Text>
      <View style={styles.methodGrid}>
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodItem,
              formData.payment_method === method.id &&
                styles.methodItemSelected,
            ]}
            onPress={() =>
              setFormData({ ...formData, payment_method: method.id })
            }
          >
            <Text
              style={[
                styles.methodItemText,
                formData.payment_method === method.id &&
                  styles.methodItemTextSelected,
              ]}
            >
              {method.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPaymentTypePicker = () => (
    <View style={styles.pickerSection}>
      <Text style={styles.label}>Payment Type</Text>
      <View style={styles.typeGrid}>
        {PAYMENT_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeItem,
              formData.payment_type === type.id && {
                backgroundColor: type.color,
              },
            ]}
            onPress={() => setFormData({ ...formData, payment_type: type.id })}
          >
            <Text
              style={[
                styles.typeItemText,
                formData.payment_type === type.id &&
                  styles.typeItemTextSelected,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

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

        {/* Outstanding Balance Card */}
        {formData.supplier_id && (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Outstanding Balance</Text>
            <Text
              style={[
                styles.balanceValue,
                { color: outstandingBalance <= 0 ? "#28a745" : "#dc3545" },
              ]}
            >
              ${outstandingBalance.toFixed(2)}
            </Text>
            {outstandingBalance > 0 && (
              <TouchableOpacity
                style={styles.fullPaymentButton}
                onPress={setFullPaymentAmount}
              >
                <Text style={styles.fullPaymentButtonText}>
                  Pay Full Amount
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.form}>
          {renderSupplierPicker()}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount *</Text>
            <TextInput
              style={styles.amountInput}
              value={formData.amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>

          {renderPaymentMethodPicker()}
          {renderPaymentTypePicker()}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Payment Date</Text>
            <TextInput
              style={styles.input}
              value={formData.payment_date}
              onChangeText={(value) =>
                setFormData({ ...formData, payment_date: value })
              }
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reference Number</Text>
            <TextInput
              style={styles.input}
              value={formData.reference_number}
              onChangeText={(value) =>
                setFormData({ ...formData, reference_number: value })
              }
              placeholder="Check number, transaction ID, etc."
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

          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Payment Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment Amount:</Text>
              <Text style={styles.summaryValue}>
                ${parseFloat(formData.amount || 0).toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Current Outstanding:</Text>
              <Text style={styles.summaryValue}>
                ${outstandingBalance.toFixed(2)}
              </Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Balance After Payment:</Text>
              <Text
                style={[
                  styles.totalValue,
                  {
                    color:
                      outstandingBalance - parseFloat(formData.amount || 0) <= 0
                        ? "#28a745"
                        : "#dc3545",
                  },
                ]}
              >
                $
                {(
                  outstandingBalance - parseFloat(formData.amount || 0)
                ).toFixed(2)}
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
            {isSaving ? "Saving..." : "Record Payment"}
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
  balanceCard: {
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 0,
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
    fontSize: 32,
    fontWeight: "bold",
  },
  fullPaymentButton: {
    marginTop: 12,
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  fullPaymentButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
  methodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  methodItem: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  methodItemSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  methodItemText: {
    fontSize: 14,
    color: "#333",
  },
  methodItemTextSelected: {
    color: "#fff",
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  typeItem: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  typeItemText: {
    fontSize: 14,
    color: "#333",
  },
  typeItemTextSelected: {
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
  amountInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
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
