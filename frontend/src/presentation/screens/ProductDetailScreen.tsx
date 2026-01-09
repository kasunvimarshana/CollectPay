/**
 * Product Detail Screen
 * Displays detailed product information and rate history
 * Refactored for better separation of concerns and reusability
 */

import React from 'react';
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
  ProductInfo,
  RateInfo,
  ProductActionButtons
} from '../components';
import { useProduct, useProductRate } from '../hooks';
import THEME from '../../core/constants/theme';
import Logger from '../../core/utils/Logger';

export const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const productId = (route.params as any)?.productId;
  const insets = useSafeAreaInsets();

  // Use custom hooks for data fetching
  const { product, loading } = useProduct(productId);
  const { currentRate } = useProductRate(productId);

  const handleEdit = () => {
    (navigation.navigate as any)('ProductForm', { productId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
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
      await apiClient.delete(`/products/${productId}`);
      Alert.alert('Success', 'Product deleted successfully');
      navigation.goBack();
    } catch (error) {
      Logger.error('Error deleting product', error);
      Alert.alert('Error', 'Failed to delete product');
    }
  };

  const handleViewRateHistory = () => {
    (navigation.navigate as any)('RateHistory', { 
      productId, 
      productName: product?.name 
    });
  };

  if (loading) {
    return <Loading message="Loading product..." />;
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <EmptyState 
          message="Product not found" 
          icon="❌"
        />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingBottom: insets.bottom + THEME.spacing.lg }}
    >
      <ScreenHeader 
        title={product.name} 
        showBackButton={true}
        variant="light"
      />

      <ProductInfo product={product} />

      {currentRate && (
        <RateInfo 
          rate={currentRate}
          onViewHistory={handleViewRateHistory}
        />
      )}

      <ProductActionButtons
        canEdit={canUpdate(user, 'products')}
        canDelete={canDelete(user, 'products')}
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
