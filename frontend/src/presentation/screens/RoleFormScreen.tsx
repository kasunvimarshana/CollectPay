/**
 * Role Form Screen
 * Create or edit role with permission management
 */

import React, { useState, useEffect } from 'react';
import THEME from '../../core/constants/theme';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../../infrastructure/api/apiClient';
import { PERMISSIONS } from '../../core/utils/permissions';

// Utility function to format permission text for display
const formatPermissionText = (permission: string): string => {
  return permission.replace(/_/g, ' ').toLowerCase();
};

// Available permissions grouped by resource
const PERMISSION_GROUPS = {
  Users: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.UPDATE_USERS,
    PERMISSIONS.DELETE_USERS,
  ],
  Roles: [
    PERMISSIONS.VIEW_ROLES,
    PERMISSIONS.CREATE_ROLES,
    PERMISSIONS.UPDATE_ROLES,
    PERMISSIONS.DELETE_ROLES,
  ],
  Suppliers: [
    PERMISSIONS.VIEW_SUPPLIERS,
    PERMISSIONS.CREATE_SUPPLIERS,
    PERMISSIONS.UPDATE_SUPPLIERS,
    PERMISSIONS.DELETE_SUPPLIERS,
  ],
  Products: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_PRODUCTS,
    PERMISSIONS.UPDATE_PRODUCTS,
    PERMISSIONS.DELETE_PRODUCTS,
  ],
  Rates: [
    PERMISSIONS.VIEW_RATES,
    PERMISSIONS.CREATE_RATES,
    PERMISSIONS.UPDATE_RATES,
    PERMISSIONS.DELETE_RATES,
  ],
  Collections: [
    PERMISSIONS.VIEW_COLLECTIONS,
    PERMISSIONS.CREATE_COLLECTIONS,
    PERMISSIONS.UPDATE_COLLECTIONS,
    PERMISSIONS.DELETE_COLLECTIONS,
  ],
  Payments: [
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.CREATE_PAYMENTS,
    PERMISSIONS.UPDATE_PAYMENTS,
    PERMISSIONS.DELETE_PAYMENTS,
  ],
};

export const RoleFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const roleId = (route.params as any)?.roleId;
  const isEditMode = !!roleId;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (isEditMode) {
      loadRole();
    }
  }, [roleId]);

  const loadRole = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>(`/roles/${roleId}`);
      if (response.success && response.data) {
        setName(response.data.name);
        setDisplayName(response.data.display_name);
        setDescription(response.data.description);
        setSelectedPermissions(response.data.permissions || []);
      }
    } catch (error) {
      console.error('Error loading role:', error);
      Alert.alert('Error', 'Failed to load role');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const toggleGroupPermissions = (groupPermissions: string[]) => {
    const allSelected = groupPermissions.every((p) =>
      selectedPermissions.includes(p)
    );

    if (allSelected) {
      // Remove all group permissions
      setSelectedPermissions((prev) =>
        prev.filter((p) => !groupPermissions.includes(p))
      );
    } else {
      // Add all group permissions
      setSelectedPermissions((prev) => {
        const newPerms = [...prev];
        groupPermissions.forEach((p) => {
          if (!newPerms.includes(p)) {
            newPerms.push(p);
          }
        });
        return newPerms;
      });
    }
  };

  const handleSubmit = async () => {
    if (!name || !displayName || !description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (selectedPermissions.length === 0) {
      Alert.alert('Error', 'Please select at least one permission');
      return;
    }

    try {
      setSubmitting(true);
      const data = {
        name,
        display_name: displayName,
        description,
        permissions: selectedPermissions,
      };

      if (isEditMode) {
        await apiClient.put(`/roles/${roleId}`, data);
        Alert.alert('Success', 'Role updated successfully');
      } else {
        await apiClient.post('/roles', data);
        Alert.alert('Success', 'Role created successfully');
      }
      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving role:', error);
      const message = error.response?.data?.message || 'Failed to save role';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + THEME.spacing.lg }}>
      <View style={[styles.header, { paddingTop: insets.top + THEME.spacing.base }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isEditMode ? 'Edit Role' : 'Create Role'}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>System Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., manager, collector"
            value={name}
            onChangeText={setName}
            autoCapitalize="none"
            editable={!isEditMode}
          />
          {isEditMode && (
            <Text style={styles.helpText}>System name cannot be changed to maintain referential integrity</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Display Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Manager, Collector"
            value={displayName}
            onChangeText={setDisplayName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the role's purpose"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Permissions *</Text>
          <Text style={styles.helpText}>
            Selected: {selectedPermissions.length} permissions
          </Text>

          {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => {
            const allSelected = permissions.every((p) =>
              selectedPermissions.includes(p)
            );

            return (
              <View key={groupName} style={styles.permissionGroup}>
                <TouchableOpacity
                  style={styles.groupHeader}
                  onPress={() => toggleGroupPermissions(permissions)}
                >
                  <Text style={styles.groupTitle}>{groupName}</Text>
                  <View style={[
                    styles.groupCheckbox,
                    allSelected && styles.groupCheckboxSelected
                  ]}>
                    {allSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>

                <View>
                  {permissions.map((permission) => (
                    <TouchableOpacity
                      key={permission}
                      style={styles.permissionItem}
                      onPress={() => togglePermission(permission)}
                    >
                      <View style={[
                        styles.checkbox,
                        selectedPermissions.includes(permission) && styles.checkboxSelected
                      ]}>
                        {selectedPermissions.includes(permission) && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                      <Text style={styles.permissionLabel}>
                        {formatPermissionText(permission)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={THEME.colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditMode ? 'Update Role' : 'Create Role'}
            </Text>
          )}
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
  form: {
    padding: THEME.spacing.base,
  },
  formGroup: {
    marginBottom: THEME.spacing.lg,
  },
  label: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.sm,
  },
  input: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.base,
    padding: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
  permissionGroup: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.base,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  groupTitle: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: THEME.colors.primary,
  },
  groupCheckbox: {
    width: 24,
    height: 24,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupCheckboxSelected: {
    backgroundColor: THEME.colors.primary,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
  },
  checkboxSelected: {
    backgroundColor: THEME.colors.primary,
  },
  checkmark: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.base,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  permissionLabel: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
    textTransform: 'capitalize',
  },
  submitButton: {
    backgroundColor: THEME.colors.primary,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
    marginTop: THEME.spacing.lg,
  },
  submitButtonDisabled: {
    backgroundColor: THEME.colors.gray300,
  },
  submitButtonText: {
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
});
