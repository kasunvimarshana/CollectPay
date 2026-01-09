/**
 * Supplier Detail Screen
 * Shows detailed information about a supplier including balance, collections, and payments
 * Refactored for better separation of concerns and reusability
 */

import React from 'react';
import THEME from '../../core/constants/theme';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../../infrastructure/api/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { canUpdate, canDelete } from '../../core/utils/permissions';
import {
  ScreenHeader,
  Loading,
  EmptyState,
  SupplierInfo,
  SupplierBalanceInfo,
  DetailActionButtons,
} from '../components';
import { useSupplier, useSupplierBalance } from '../hooks';
import Logger from '../../core/utils/Logger';

export const SupplierDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const supplierId = (route.params as any)?.supplierId;
  const insets = useSafeAreaInsets();

  // Use custom hooks for data fetching
  const { supplier, loading } = useSupplier(supplierId);
  const { balance } = useSupplierBalance(supplierId);

  const handleEdit = () => {
    (navigation.navigate as any)('SupplierForm', { supplierId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Supplier',
      'Are you sure you want to delete this supplier? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      await apiClient.delete(`/suppliers/${supplierId}`);
      Alert.alert('Success', 'Supplier deleted successfully');
      navigation.goBack();
    } catch (error) {
      Logger.error('Error deleting supplier', error);
      Alert.alert('Error', 'Failed to delete supplier');
    }
  };

  const handleViewCollections = () => {
    (navigation.navigate as any)('CollectionList', { supplierId });
  };

  const handleViewPayments = () => {
    (navigation.navigate as any)('PaymentList', { supplierId });
  };

  if (loading) {
    return <Loading message="Loading supplier..." />;
  }

  if (!supplier) {
    return (
      <View style={styles.container}>
        <EmptyState message="Supplier not found" icon="❌" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + THEME.spacing.lg }}
    >
      <ScreenHeader title={supplier.name} showBackButton={true} variant="light" />

      <SupplierInfo supplier={supplier} />

      {balance && (
        <SupplierBalanceInfo
          balance={balance}
          onViewCollections={handleViewCollections}
          onViewPayments={handleViewPayments}
        />
      )}

      <DetailActionButtons
        canEdit={canUpdate(user, 'suppliers')}
        canDelete={canDelete(user, 'suppliers')}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
});
