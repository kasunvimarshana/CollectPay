/**
 * User Detail Screen
 * Displays detailed user information
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../../infrastructure/api/apiClient';
import { User } from '../../domain/entities/User';
import THEME from '../../core/constants/theme';

export const UserDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const userId = (route.params as any)?.userId;
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      const response = await apiClient.get<any>(`/users/${userId}`);
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('Error', 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    (navigation.navigate as any)('UserForm', { userId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user?',
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
      await apiClient.delete(`/users/${userId}`);
      Alert.alert('Success', 'User deleted successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Error', 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading user...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + THEME.spacing.lg }}>
      <View style={[styles.header, { paddingTop: insets.top + THEME.spacing.base }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{user.name}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.statusRow}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: user.is_active ? THEME.colors.success : THEME.colors.error }
          ]}>
            <Text style={styles.statusText}>
              {user.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email:</Text>
          <Text style={styles.detailValue}>{user.email}</Text>
        </View>

        {user.role && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Role:</Text>
            <Text style={styles.detailValue}>{user.role.name}</Text>
          </View>
        )}

        {user.created_at && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created:</Text>
            <Text style={styles.detailValue}>
              {new Date(user.created_at).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editButtonText}>Edit User</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete User</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  backButton: {
    marginBottom: THEME.spacing.sm,
  },
  backButtonText: {
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.primary,
  },
  title: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  section: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.base,
    marginTop: THEME.spacing.md,
  },
  statusRow: {
    marginBottom: THEME.spacing.base,
  },
  statusBadge: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.xs + 2,
    borderRadius: THEME.borderRadius.md,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: THEME.spacing.md,
  },
  detailLabel: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
    width: 100,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  detailValue: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: THEME.spacing.base,
  },
  editButton: {
    flex: 1,
    backgroundColor: THEME.colors.primary,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
    marginRight: THEME.spacing.md,
  },
  editButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: THEME.colors.error,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  loadingText: {
    marginTop: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  errorText: {
    fontSize: THEME.typography.fontSize.lg,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.base,
  },
  backText: {
    fontSize: 16,
    color: THEME.colors.primary,
  },
});
