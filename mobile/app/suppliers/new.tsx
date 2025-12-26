import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardContent, Button, TextInput } from '../../../src/components/ui';
import { useSuppliers } from '../../../src/hooks';
import { colors, spacing, typography } from '../../../src/theme';

export default function NewSupplierScreen() {
  const { addSupplier } = useSuppliers({});
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    region: '',
    address: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    branchCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    if (!formData.region.trim()) {
      newErrors.region = 'Region is required';
    }
    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);

    try {
      // Generate a supplier code
      const code = `SUP-${Date.now().toString(36).toUpperCase()}`;

      await addSupplier({
        code,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        region: formData.region.trim(),
        address: formData.address.trim() || undefined,
        bankDetails: formData.bankName ? {
          bankName: formData.bankName.trim(),
          accountNumber: formData.accountNumber.trim(),
          accountName: formData.accountName.trim(),
          branchCode: formData.branchCode.trim() || undefined,
        } : undefined,
        status: 'active',
        currentBalance: 0,
      });

      Alert.alert('Success', 'Supplier created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create supplier');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'New Supplier' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Basic Info */}
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <Card>
            <CardContent>
              <TextInput
                label="Supplier Name *"
                placeholder="Enter supplier name"
                value={formData.name}
                onChangeText={(v) => updateField('name', v)}
                error={errors.name}
              />
              <TextInput
                label="Phone Number *"
                placeholder="Enter phone number"
                value={formData.phone}
                onChangeText={(v) => updateField('phone', v)}
                keyboardType="phone-pad"
                error={errors.phone}
              />
              <TextInput
                label="Email"
                placeholder="Enter email address"
                value={formData.email}
                onChangeText={(v) => updateField('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />
            </CardContent>
          </Card>

          {/* Location */}
          <Text style={styles.sectionTitle}>Location</Text>
          <Card>
            <CardContent>
              <TextInput
                label="Region *"
                placeholder="e.g., Central, Southern, Western"
                value={formData.region}
                onChangeText={(v) => updateField('region', v)}
                error={errors.region}
              />
              <TextInput
                label="Address"
                placeholder="Enter full address"
                value={formData.address}
                onChangeText={(v) => updateField('address', v)}
                multiline
                numberOfLines={3}
              />
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Text style={styles.sectionTitle}>Bank Details (Optional)</Text>
          <Card>
            <CardContent>
              <TextInput
                label="Bank Name"
                placeholder="Enter bank name"
                value={formData.bankName}
                onChangeText={(v) => updateField('bankName', v)}
              />
              <TextInput
                label="Account Number"
                placeholder="Enter account number"
                value={formData.accountNumber}
                onChangeText={(v) => updateField('accountNumber', v)}
                keyboardType="numeric"
              />
              <TextInput
                label="Account Name"
                placeholder="Enter account holder name"
                value={formData.accountName}
                onChangeText={(v) => updateField('accountName', v)}
              />
              <TextInput
                label="Branch Code"
                placeholder="Enter branch code"
                value={formData.branchCode}
                onChangeText={(v) => updateField('branchCode', v)}
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
              title={isLoading ? 'Creating...' : 'Create Supplier'}
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
