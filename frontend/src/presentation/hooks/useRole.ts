/**
 * Custom hook for fetching role data
 * Encapsulates role loading logic with loading and error states
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import apiClient from '../../infrastructure/api/apiClient';
import { Role } from '../../domain/entities/Role';
import Logger from '../../core/utils/Logger';

interface UseRoleResult {
  role: Role | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useRole = (roleId: string | number | undefined): UseRoleResult => {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadRole = useCallback(async () => {
    if (!roleId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Role>(`/roles/${roleId}`);
      if (response.success && response.data) {
        setRole(response.data);
      }
    } catch (err) {
      const error = err as Error;
      Logger.error('Error loading role', error);
      setError(error);
      Alert.alert('Error', 'Failed to load role details');
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    loadRole();
  }, [loadRole]);

  return {
    role,
    loading,
    error,
    refetch: loadRole,
  };
};
