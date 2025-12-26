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
import { useCollections, useSuppliers, useAuth } from '../../../src/hooks';
import { colors, spacing, typography } from '../../../src/theme';
import { Supplier } from '../../../src/domain/entities';

export default function NewCollectionScreen() {
  const { user } = useAuth();
  const { addCollection } = useCollections({});
  const { suppliers } = useSuppliers({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showSupplierPicker, setShowSupplierPicker] = useState(false);
  const [formData, setFormData] = useState({
    quantity: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock product and rate for demo - in production, fetch from products list
  const mockProduct = {
    id: 'prod-tea-green',
    name: 'Green Tea Leaves',
    unit: 'kg',
    currentRate: 180.00,
  };

  const quantity = parseFloat(formData.quantity) || 0;
  const totalAmount = quantity * mockProduct.currentRate;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedSupplier) {
      newErrors.supplier = 'Please select a supplier';
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Enter a valid quantity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);

    try {
      await addCollection({
        supplierId: selectedSupplier!.id,
        productId: mockProduct.id,
        quantity: parseFloat(formData.quantity),
        unit: mockProduct.unit,
        rateAtCollection: mockProduct.currentRate,
        totalAmount,
        collectedAt: new Date(),
        collectedBy: user?.id || 'unknown',
        notes: formData.notes.trim() || undefined,
        status: 'pending',
      });

      Alert.alert('Success', 'Collection recorded successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create collection');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
  };

  return (
    <>
      <Stack.Screen options={{ title: 'New Collection' }} />
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
                        <Text style={styles.supplierRegion}>{supplier.region}</Text>
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

          {/* Product Info (Demo) */}
          <Text style={styles.sectionTitle}>Product</Text>
          <Card>
            <CardContent>
              <View style={styles.productInfo}>
                <View>
                  <Text style={styles.productName}>{mockProduct.name}</Text>
                  <Text style={styles.productRate}>
                    Rate: {formatCurrency(mockProduct.currentRate)}/{mockProduct.unit}
                  </Text>
                </View>
                <Badge label={mockProduct.unit} variant="primary" />
              </View>
            </CardContent>
          </Card>

          {/* Collection Details */}
          <Text style={styles.sectionTitle}>Collection Details</Text>
          <Card>
            <CardContent>
              <TextInput
                label={`Quantity (${mockProduct.unit})`}
                placeholder="Enter quantity"
                value={formData.quantity}
                onChangeText={(v) => {
                  setFormData((prev) => ({ ...prev, quantity: v }));
                  if (errors.quantity) {
                    setErrors((prev) => ({ ...prev, quantity: '' }));
                  }
                }}
                keyboardType="decimal-pad"
                error={errors.quantity}
              />
              <TextInput
                label="Notes (Optional)"
                placeholder="Add any notes about this collection"
                value={formData.notes}
                onChangeText={(v) => setFormData((prev) => ({ ...prev, notes: v }))}
                multiline
                numberOfLines={3}
              />
            </CardContent>
          </Card>

          {/* Summary */}
          <Text style={styles.sectionTitle}>Summary</Text>
          <Card style={styles.summaryCard}>
            <CardContent>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Quantity</Text>
                <Text style={styles.summaryValue}>
                  {quantity > 0 ? `${quantity.toFixed(2)} ${mockProduct.unit}` : '-'}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Rate</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(mockProduct.currentRate)}/{mockProduct.unit}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(totalAmount)}
                </Text>
              </View>
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
              title={isLoading ? 'Saving...' : 'Save Collection'}
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
  supplierRegion: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  checkmark: {
    fontSize: typography.fontSize.lg,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.bold,
  },
  productInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  productRate: {
    fontSize: typography.fontSize.sm,
    color: colors.success.main,
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: colors.primary[50],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  totalLabel: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  totalValue: {
    fontSize: typography.fontSize.xl,
    color: colors.success.main,
    fontWeight: typography.fontWeight.bold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.sm,
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
