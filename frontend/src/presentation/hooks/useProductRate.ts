/**
 * Custom hook for fetching product current rate
 * Encapsulates rate loading logic with loading and error states
 */

import { useState, useEffect, useCallback } from "react";
import apiClient from "../../infrastructure/api/apiClient";
import { Rate } from "../../domain/entities/Product";

interface UseProductRateResult {
  currentRate: Rate | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useProductRate = (
  productId: string | undefined
): UseProductRateResult => {
  const [currentRate, setCurrentRate] = useState<Rate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadCurrentRate = useCallback(async () => {
    if (!productId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // ApiResponse<Rate> means the response.data field contains a Rate
      const response = await apiClient.get<{ rate: Rate }>(
        `/products/${productId}/current-rate`
      );
      if (response.success && response.data) {
        setCurrentRate(response.data.rate as Rate);
      }
    } catch (err) {
      const error = err as Error;
      console.error("Error loading current rate:", error);
      setError(error);
      // Don't show alert for rate loading errors - they're not critical
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadCurrentRate();
  }, [loadCurrentRate]);

  return {
    currentRate,
    loading,
    error,
    refetch: loadCurrentRate,
  };
};
