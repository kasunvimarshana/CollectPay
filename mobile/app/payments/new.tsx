import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardContent, Button, TextInput, Badge } from '../../../src/components/ui';
import { usePayments, useSuppliers, useAuth, useSettlementCalculation } from '../../../src/hooks';
import { colors, spacing, typography } from '../../../src/theme';
import { Supplier, Payment } from '../../../src/domain/entities';

type PaymentMethod = Payment['method'];

export default function NewPaymentScreen() {
  const { user } = useAuth();
  const { addPayment } = usePayments({});
  const { suppliers } = useSuppliers({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showSupplierPicker, setShowSupplierPicker] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    method: 'cash' as PaymentMethod,
    notes: '',
    bankReference: '',
    chequeNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { settlement, isLoading: settlementLoading } = useSettlementCalculation(
    selectedSupplier?.id || ''
  );

  const paymentMethods: { key: PaymentMethod; label: string; icon: string }[] = [
    { key: 'cash', label: 'Cash', icon: '💵' },
    { key: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
    { key: 'cheque', label: 'Cheque', icon: '📝' },
    { key: 'mobile_money', label: 'Mobile Money', icon: '📱' },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedSupplier) {
      newErrors.supplier = 'Please select a supplier';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Enter a valid amount';
    }
    if (formData.method === 'bank_transfer' && !formData.bankReference.trim()) {
      newErrors.bankReference = 'Bank reference is required';
    }
    if (formData.method === 'cheque' && !formData.chequeNumber.trim()) {
      newErrors.chequeNumber = 'Cheque number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);

    try {
      // Generate reference number
      const refPrefix = formData.method === 'cash' ? 'CSH' : 
                        formData.method === 'bank_transfer' ? 'BNK' :
                        formData.method === 'cheque' ? 'CHQ' : 'MOB';
      const referenceNumber = `${refPrefix}-${Date.now().toString(36).toUpperCase()}`;

      await addPayment({
        supplierId: selectedSupplier!.id,
        amount: parseFloat(formData.amount),
        method: formData.method,
        referenceNumber,
        paidAt: new Date(),
        paidBy: user?.id || 'unknown',
        notes: formData.notes.trim() || undefined,
        status: 'pending',
      });

      Alert.alert('Success', 'Payment recorded successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create payment');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
  };

  const setFullBalance = () => {
    if (settlement) {
      setFormData((prev) => ({
        ...prev,
        amount: settlement.balance.toString(),
      }));
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'New Payment' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Supplier Selection */}
          <Text style={styles.sectionTitle}>Supplier</Text>
          <Card>
            <CardContent>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowSupplierPicker(!showSupplierPicker)}
              >
                <Text style={selectedSupplier ? styles.pickerValue : styles.pickerPlaceholder}>
                  {selectedSupplier ? selectedSupplier.name : 'Select a supplier'}
                </Text>
                <Text style={styles.pickerArrow}>▼</Text>
              </TouchableOpacity>

              {errors.supplier && (
                <Text style={styles.errorText}>{errors.supplier}</Text>
              )}

              {showSupplierPicker && (
                <View style={styles.supplierList}>
                  {suppliers.filter(s => s.status === 'active').map((supplier) => (
                    <TouchableOpacity
                      key={supplier.id}
                      style={[
                        styles.supplierItem,
                        selectedSupplier?.id === supplier.id && styles.supplierItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedSupplier(supplier);
                        setShowSupplierPicker(false);
                        if (errors.supplier) {
                          setErrors((prev) => ({ ...prev, supplier: '' }));
                        }
                      }}
                    >
                      <View>
                        <Text style={styles.supplierName}>{supplier.name}</Text>
                        <Text style={styles.supplierBalance}>
                          Balance: {formatCurrency(supplier.currentBalance || 0)}
                        </Text>
                      </View>
                      {selectedSupplier?.id === supplier.id && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </CardContent>
          </Card>

          {/* Settlement Info */}
          {selectedSupplier && settlement && (
            <>
              <Text style={styles.sectionTitle}>Settlement Summary</Text>
              <Card style={styles.settlementCard}>
                <CardContent>
                  <View style={styles.settlementRow}>
                    <Text style={styles.settlementLabel}>Total Collections</Text>
                    <Text style={styles.settlementValue}>
                      {formatCurrency(settlement.totalCollections)}
                    </Text>
                  </View>
                  <View style={styles.settlementRow}>
                    <Text style={styles.settlementLabel}>Total Paid</Text>
                    <Text style={styles.settlementValue}>
                      {formatCurrency(settlement.totalPayments)}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.settlementRow}>
                    <Text style={styles.balanceLabel}>Outstanding Balance</Text>
                    <Text style={styles.balanceValue}>
                      {formatCurrency(settlement.balance)}
                    </Text>
                  </View>
                </CardContent>
              </Card>
            </>
          )}

          {/* Payment Method */}
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.methodGrid}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.key}
                style={[
                  styles.methodButton,
                  formData.method === method.key && styles.methodButtonActive,
                ]}
                onPress={() => setFormData((prev) => ({ ...prev, method: method.key }))}
              >
                <Text style={styles.methodIcon}>{method.icon}</Text>
                <Text style={[
                  styles.methodLabel,
                  formData.method === method.key && styles.methodLabelActive,
                ]}>
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Payment Details */}
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <Card>
            <CardContent>
              <View style={styles.amountContainer}>
                <View style={styles.amountInputWrapper}>
                  <TextInput
                    label="Amount (LKR)"
                    placeholder="0.00"
                    value={formData.amount}
                    onChangeText={(v) => {
                      setFormData((prev) => ({ ...prev, amount: v }));
                      if (errors.amount) {
                        setErrors((prev) => ({ ...prev, amount: '' }));
                      }
                    }}
                    keyboardType="decimal-pad"
                    error={errors.amount}
                  />
                </View>
                {settlement && settlement.balance > 0 && (
                  <TouchableOpacity style={styles.fullBalanceButton} onPress={setFullBalance}>
                    <Text style={styles.fullBalanceText}>Full Balance</Text>
                  </TouchableOpacity>
                )}
              </View>

              {formData.method === 'bank_transfer' && (
                <TextInput
                  label="Bank Reference"
                  placeholder="Enter transaction reference"
                  value={formData.bankReference}
                  onChangeText={(v) => {
                    setFormData((prev) => ({ ...prev, bankReference: v }));
                    if (errors.bankReference) {
                      setErrors((prev) => ({ ...prev, bankReference: '' }));
                    }
                  }}
                  error={errors.bankReference}
                />
              )}

              {formData.method === 'cheque' && (
                <TextInput
                  label="Cheque Number"
                  placeholder="Enter cheque number"
                  value={formData.chequeNumber}
                  onChangeText={(v) => {
                    setFormData((prev) => ({ ...prev, chequeNumber: v }));
                    if (errors.chequeNumber) {
                      setErrors((prev) => ({ ...prev, chequeNumber: '' }));
                    }
                  }}
                  error={errors.chequeNumber}
                />
              )}

              <TextInput
                label="Notes (Optional)"
                placeholder="Add any notes about this payment"
                value={formData.notes}
                onChangeText={(v) => setFormData((prev) => ({ ...prev, notes: v }))}
                multiline
                numberOfLines={3}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => router.back()}
              style={styles.cancelButton}
            />
            <Button
              title={isLoading ? 'Processing...' : 'Record Payment'}
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    marginLeft: spacing.xs,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  pickerPlaceholder: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  pickerValue: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  pickerArrow: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error.main,
    marginTop: spacing.xs,
  },
  supplierList: {
    marginTop: spacing.md,
    maxHeight: 200,
  },
  supplierItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  supplierItemSelected: {
    backgroundColor: colors.primary[50],
  },
  supplierName: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  supplierBalance: {
    fontSize: typography.fontSize.sm,
    color: colors.success.main,
  },
  checkmark: {
    fontSize: typography.fontSize.lg,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.bold,
  },
  settlementCard: {
    backgroundColor: colors.primary[50],
  },
  settlementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  settlementLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  settlementValue: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  balanceLabel: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  balanceValue: {
    fontSize: typography.fontSize.xl,
    color: colors.success.main,
    fontWeight: typography.fontWeight.bold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.sm,
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  methodButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background.paper,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodButtonActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  methodIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  methodLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  methodLabelActive: {
    color: colors.primary[500],
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  amountInputWrapper: {
    flex: 1,
  },
  fullBalanceButton: {
    backgroundColor: colors.success.light,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  fullBalanceText: {
    fontSize: typography.fontSize.sm,
    color: colors.success.dark,
    fontWeight: typography.fontWeight.medium,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});
