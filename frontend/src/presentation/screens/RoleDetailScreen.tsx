/**
 * Role Detail Screen
 * Displays detailed role information including permissions
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
import { Role } from '../../domain/entities/Role';
import { useAuth } from '../contexts/AuthContext';
import { canUpdate, canDelete } from '../../core/utils/permissions';
import THEME from '../../core/constants/theme';
import Logger from '../../core/utils/Logger';

export const RoleDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const roleId = (route.params as any)?.roleId;
  const { user: currentUser } = useAuth();
  const insets = useSafeAreaInsets();

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRole();
  }, [roleId]);

  const loadRole = async () => {
    try {
      const response = await apiClient.get<any>(`/roles/${roleId}`);
      if (response.success && response.data) {
        setRole(response.data);
      }
    } catch (error) {
      Logger.error('Error loading role', error);
      Alert.alert('Error', 'Failed to load role details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    (navigation.navigate as any)('RoleForm', { roleId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Role',
      'Are you sure you want to delete this role? This action cannot be undone.',
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
      await apiClient.delete(`/roles/${roleId}`);
      Alert.alert('Success', 'Role deleted successfully');
      navigation.goBack();
    } catch (error) {
      Logger.error('Error deleting role', error);
      Alert.alert('Error', 'Failed to delete role');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading role...</Text>
      </View>
    );
  }

  if (!role) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Role not found</Text>
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
        <Text style={styles.title}>{String(role.display_name)}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>System Name:</Text>
          <Text style={styles.detailValue}>{String(role.name)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Description:</Text>
          <Text style={styles.detailValue}>{String(role.description)}</Text>
        </View>

        {role.users_count !== undefined && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Users:</Text>
            <Text style={styles.detailValue}>
              {String(role.users_count)} user{role.users_count !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {role.created_at && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created:</Text>
            <Text style={styles.detailValue}>
              {new Date(role.created_at).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permissions</Text>
        <Text style={styles.permissionCount}>
          {String(role.permissions.length)} permission{role.permissions.length !== 1 ? 's' : ''}
        </Text>
        
        <View style={styles.permissionsGrid}>
          {role.permissions.map((permission, index) => (
            <View key={index} style={styles.permissionChip}>
              <Text style={styles.permissionText}>{String(permission)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actionButtons}>
        {canUpdate(currentUser, 'roles') && (
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Edit Role</Text>
          </TouchableOpacity>
        )}

        {canDelete(currentUser, 'roles') && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Role</Text>
          </TouchableOpacity>
        )}
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
  sectionTitle: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: THEME.spacing.md,
  },
  detailLabel: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
    width: 120,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  detailValue: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  permissionCount: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.primary,
    marginBottom: THEME.spacing.base,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  permissionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -THEME.spacing.xs,
  },
  permissionChip: {
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.xs + 2,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    margin: THEME.spacing.xs,
  },
  permissionText: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.primary,
    fontWeight: THEME.typography.fontWeight.medium,
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
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.primary,
  },
});
