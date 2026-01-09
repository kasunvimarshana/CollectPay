/**
 * Custom hook for fetching collection data
 * Encapsulates collection loading logic with loading and error states
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import apiClient from '../../infrastructure/api/apiClient';
import { Collection } from '../../domain/entities/Collection';
import Logger from '../../core/utils/Logger';

interface UseCollectionResult {
  collection: Collection | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useCollection = (collectionId: string | number | undefined): UseCollectionResult => {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCollection = useCallback(async () => {
    if (!collectionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Collection>(`/collections/${collectionId}`);
      if (response.success && response.data) {
        setCollection(response.data);
      }
    } catch (err) {
      const error = err as Error;
      Logger.error('Error loading collection', error);
      setError(error);
      Alert.alert('Error', 'Failed to load collection details');
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  return {
    collection,
    loading,
    error,
    refetch: loadCollection,
  };
};
