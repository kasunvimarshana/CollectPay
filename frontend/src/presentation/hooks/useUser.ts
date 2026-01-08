/**
 * Custom hook for fetching user data
 * Encapsulates user loading logic with loading and error states
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import apiClient from '../../infrastructure/api/apiClient';
import { User } from '../../domain/entities/User';

interface UseUserResult {
  user: User | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useUser = (userId: string | number | undefined): UseUserResult => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadUser = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<User>(`/users/${userId}`);
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error loading user:', error);
      setError(error);
      Alert.alert('Error', 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return {
    user,
    loading,
    error,
    refetch: loadUser,
  };
};
