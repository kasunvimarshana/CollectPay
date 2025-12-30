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
import apiClient from '../../infrastructure/api/apiClient';
import { Product, Rate } from '../../domain/entities/Product';

export const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const productId = (route.params as any)?.productId;

  const [product, setProduct] = useState<Product | null>(null);
  const [currentRate, setCurrentRate] = useState<Rate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
    loadCurrentRate();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const response = await apiClient.get(`/products/${productId}`);
      if (response.data.success) {
        setProduct(response.data.data);
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
      const response = await apiClient.get(`/products/${productId}/current-rate`);
      if (response.data.success) {
        setCurrentRate(response.data.data);
      }
    } catch (error) {
      console.error('Error loading current rate:', error);
    }
  };

  const handleEdit = () => {
    navigation.navigate('ProductForm' as never, { productId } as never);
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
    // TODO: Implement rate history screen
    Alert.alert('Coming Soon', 'Rate history feature will be available soon');
    // navigation.navigate('RateHistory' as never, { productId } as never);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{product.name}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.statusRow}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: product.is_active ? '#4CAF50' : '#F44336' }
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
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editButtonText}>Edit Product</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Product</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusRow: {
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 140,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  rateCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: '#007bff',
  },
});
