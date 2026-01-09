/**
 * Custom hook for fetching supplier balance
 * Encapsulates balance loading logic with loading and error states
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../infrastructure/api/apiClient';
import Logger from '../../core/utils/Logger';

interface SupplierBalance {
  balance: number;
  total_collected: number;
  total_paid: number;
  period?: {
    start_date?: string;
    end_date?: string;
  };
}

interface UseSupplierBalanceResult {
  balance: SupplierBalance | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useSupplierBalance = (supplierId: string | number | undefined): UseSupplierBalanceResult => {
  const [balance, setBalance] = useState<SupplierBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadBalance = useCallback(async () => {
    if (!supplierId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<SupplierBalance>(`/suppliers/${supplierId}/balance`);
      if (response.success && response.data) {
        setBalance(response.data);
      }
    } catch (err) {
      const error = err as Error;
      Logger.error('Error loading supplier balance', error);
      setError(error);
      // Don't show alert for balance loading failures as it's not critical
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  return {
    balance,
    loading,
    error,
    refetch: loadBalance,
  };
};
