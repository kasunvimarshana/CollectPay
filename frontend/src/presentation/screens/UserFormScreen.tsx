/**
 * User Form Screen
 * Create or edit user
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
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../../infrastructure/api/apiClient';
import { SearchableSelector } from '../components';

export const UserFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const userId = (route.params as any)?.userId;
  const isEditMode = !!userId;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [roleId, setRoleId] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (isEditMode) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>(`/users/${userId}`);
      if (response.success && response.data) {
        setName(response.data.name);
        setEmail(response.data.email);
        setRoleId(response.data.role_id?.toString() || '');
        setIsActive(response.data.is_active);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('Error', 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isEditMode && (!password || !passwordConfirmation)) {
      Alert.alert('Error', 'Password is required for new users');
      return;
    }

    if (password && password !== passwordConfirmation) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setSubmitting(true);
      const data: any = {
        name,
        email,
        is_active: isActive,
      };

      if (roleId && roleId.trim()) {
        data.role_id = parseInt(roleId, 10);
      }

      if (password) {
        data.password = password;
        data.password_confirmation = passwordConfirmation;
      }

      if (isEditMode) {
        await apiClient.put(`/users/${userId}`, data);
        Alert.alert('Success', 'User updated successfully');
      } else {
        await apiClient.post('/users', data);
        Alert.alert('Success', 'User created successfully');
      }
      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving user:', error);
      const message = error.response?.data?.message || 'Failed to save user';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + THEME.spacing.lg }}>
      <View style={[styles.header, { paddingTop: insets.top + THEME.spacing.base }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isEditMode ? 'Edit User' : 'Add User'}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Password {!isEditMode && '*'}
          </Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={isEditMode ? 'Leave blank to keep current' : 'Enter password'}
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Confirm Password {!isEditMode && '*'}
          </Text>
          <TextInput
            style={styles.input}
            value={passwordConfirmation}
            onChangeText={setPasswordConfirmation}
            placeholder="Confirm password"
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Role</Text>
          <SearchableSelector
            label=""
            placeholder="Select role (optional)"
            value={roleId}
            onSelect={(value, option) => setRoleId(value)}
            endpoint="/roles"
          />
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.label}>Active</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: '#767577', true: '#007bff' }}
            thumbColor={isActive ? '#fff' : '#f4f3f4'}
          />
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
              {isEditMode ? 'Update User' : 'Create User'}
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
  inputGroup: {
    marginBottom: THEME.spacing.lg,
  },
  label: {
    fontSize: THEME.typography.fontSize.base,
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
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  submitButton: {
    backgroundColor: THEME.colors.primary,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.bold,
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
