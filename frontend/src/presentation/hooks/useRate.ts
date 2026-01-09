/**
 * Custom hook for fetching rate data
 * Encapsulates rate loading logic with loading and error states
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import apiClient from '../../infrastructure/api/apiClient';
import { Rate } from '../../domain/entities/Product';
import Logger from '../../core/utils/Logger';

interface UseRateResult {
  rate: Rate | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useRate = (rateId: string | number | undefined): UseRateResult => {
  const [rate, setRate] = useState<Rate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadRate = useCallback(async () => {
    if (!rateId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Rate>(`/rates/${rateId}`);
      if (response.success && response.data) {
        setRate(response.data);
      }
    } catch (err) {
      const error = err as Error;
      Logger.error('Error loading rate', error);
      setError(error);
      Alert.alert('Error', 'Failed to load rate details');
    } finally {
      setLoading(false);
    }
  }, [rateId]);

  useEffect(() => {
    loadRate();
  }, [loadRate]);

  return {
    rate,
    loading,
    error,
    refetch: loadRate,
  };
};
