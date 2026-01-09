/**
 * Custom hook for fetching product data
 * Encapsulates product loading logic with loading and error states
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import apiClient from '../../infrastructure/api/apiClient';
import { Product } from '../../domain/entities/Product';
import Logger from '../../core/utils/Logger';

interface UseProductResult {
  product: Product | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useProduct = (productId: string | undefined): UseProductResult => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProduct = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // ApiResponse<Product> means the response.data field contains a Product
      const response = await apiClient.get<Product>(`/products/${productId}`);
      if (response.success && response.data) {
        setProduct(response.data);
      }
    } catch (err) {
      const error = err as Error;
      Logger.error('Error loading product', error);
      setError(error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  return {
    product,
    loading,
    error,
    refetch: loadProduct,
  };
};
