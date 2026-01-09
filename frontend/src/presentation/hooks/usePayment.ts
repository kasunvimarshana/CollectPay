/**
 * Custom hook for fetching payment data
 * Encapsulates payment loading logic with loading and error states
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import apiClient from '../../infrastructure/api/apiClient';
import { Payment } from '../../domain/entities/Payment';
import Logger from '../../core/utils/Logger';

interface UsePaymentResult {
  payment: Payment | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const usePayment = (paymentId: string | number | undefined): UsePaymentResult => {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPayment = useCallback(async () => {
    if (!paymentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Payment>(`/payments/${paymentId}`);
      if (response.success && response.data) {
        setPayment(response.data);
      }
    } catch (err) {
      const error = err as Error;
      Logger.error('Error loading payment', error);
      setError(error);
      Alert.alert('Error', 'Failed to load payment details');
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    loadPayment();
  }, [loadPayment]);

  return {
    payment,
    loading,
    error,
    refetch: loadPayment,
  };
};
