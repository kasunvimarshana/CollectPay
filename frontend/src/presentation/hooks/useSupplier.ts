/**
 * Custom hook for fetching supplier data
 * Encapsulates supplier loading logic with loading and error states
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import apiClient from '../../infrastructure/api/apiClient';
import { Supplier } from '../../domain/entities/Supplier';

interface UseSupplierResult {
  supplier: Supplier | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useSupplier = (supplierId: string | number | undefined): UseSupplierResult => {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSupplier = useCallback(async () => {
    if (!supplierId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Supplier>(`/suppliers/${supplierId}`);
      if (response.success && response.data) {
        setSupplier(response.data);
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error loading supplier:', error);
      setError(error);
      Alert.alert('Error', 'Failed to load supplier details');
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    loadSupplier();
  }, [loadSupplier]);

  return {
    supplier,
    loading,
    error,
    refetch: loadSupplier,
  };
};
