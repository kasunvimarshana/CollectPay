/**
 * Product Detail Screen
 * Displays detailed product information and rate history
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../../infrastructure/api/apiClient';
import { Product, Rate } from '../../domain/entities/Product';
import { useAuth } from '../contexts/AuthContext';
import { canUpdate, canDelete } from '../../core/utils/permissions';
import { ScreenHeader } from '../components';
import THEME from '../../core/constants/theme';

export const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const productId = (route.params as any)?.productId;
  const insets = useSafeAreaInsets();

  const [product, setProduct] = useState<Product | null>(null);
  const [currentRate, setCurrentRate] = useState<Rate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
    loadCurrentRate();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const response = await apiClient.get<any>(`/products/${productId}`);
      if (response.success && response.data) {
        setProduct(response.data);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentRate = async () => {
    try {
      const response = await apiClient.get<any>(`/products/${productId}/current-rate`);
      if (response.success && response.data) {
        setCurrentRate(response.data);
      }
    } catch (error) {
      console.error('Error loading current rate:', error);
    }
  };

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
      console.error('Error deleting product:', error);
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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + THEME.spacing.lg }}>
      <ScreenHeader 
        title={product.name} 
        showBackButton={true}
        variant="light"
      />

      <View style={styles.section}>
        <View style={styles.statusRow}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: product.is_active ? THEME.colors.success : THEME.colors.error }
          ]}>
            <Text style={styles.statusText}>
              {product.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Code:</Text>
          <Text style={styles.detailValue}>{product.code}</Text>
        </View>

        {product.description && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description:</Text>
            <Text style={styles.detailValue}>{product.description}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Base Unit:</Text>
          <Text style={styles.detailValue}>{product.base_unit}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Supported Units:</Text>
          <Text style={styles.detailValue}>
            {Array.isArray(product.supported_units)
              ? product.supported_units.join(', ')
              : product.supported_units}
          </Text>
        </View>
      </View>

      {currentRate && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Rate</Text>
          <View style={styles.rateCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rate:</Text>
              <Text style={styles.detailValue}>{currentRate.rate} per {currentRate.unit}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Effective From:</Text>
              <Text style={styles.detailValue}>
                {new Date(currentRate.effective_from).toLocaleDateString()}
              </Text>
            </View>
            {currentRate.effective_to && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Effective To:</Text>
                <Text style={styles.detailValue}>
                  {new Date(currentRate.effective_to).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleViewRateHistory}
          >
            <Text style={styles.secondaryButtonText}>View Rate History</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.actionButtons}>
        {canUpdate(user, 'products') && (
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Edit Product</Text>
          </TouchableOpacity>
        )}

        {canDelete(user, 'products') && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Product</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  section: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.base,
    marginTop: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.md,
  },
  statusRow: {
    marginBottom: THEME.spacing.base,
  },
  statusBadge: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.xs + 2,
    borderRadius: THEME.borderRadius.md,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: THEME.spacing.md,
  },
  detailLabel: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
    width: 140,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  detailValue: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  rateCard: {
    backgroundColor: THEME.colors.gray100,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.base,
    marginBottom: THEME.spacing.md,
  },
  secondaryButton: {
    backgroundColor: THEME.colors.gray600,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: THEME.spacing.base,
    gap: THEME.spacing.md,
  },
  editButton: {
    flex: 1,
    backgroundColor: THEME.colors.primary,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
  },
  editButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: THEME.colors.error,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: THEME.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: THEME.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  errorText: {
    fontSize: 18,
    color: THEME.colors.textSecondary,
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: THEME.colors.primary,
  },
});
