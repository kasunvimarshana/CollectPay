/**
 * Registration Screen
 * User self-registration with role assignment
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import THEME from '../../core/constants/theme';

export const RegisterScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const validateForm = (): boolean => {
    if (!name || !email || !password || !passwordConfirmation) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (password !== passwordConfirmation) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      Alert.alert('Success', 'Registration successful!');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Unable to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    (navigation.navigate as any)('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + THEME.spacing.lg, paddingBottom: insets.bottom + THEME.spacing.lg }]}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Ledger Management System</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={THEME.colors.white} />
              ) : (
                <Text style={styles.buttonText}>Register</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={goToLogin}
            >
              <Text style={styles.linkText}>
                Already have an account? <Text style={styles.linkTextBold}>Login</Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Registration Notes:</Text>
              <Text style={styles.infoText}>• Password must be at least 8 characters</Text>
              <Text style={styles.infoText}>• New accounts require admin approval</Text>
              <Text style={styles.infoText}>• Default role will be assigned by admin</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: THEME.spacing.lg,
    paddingTop: THEME.spacing.xxxl,
  },
  title: {
    fontSize: THEME.typography.fontSize.huge,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
    textAlign: 'center',
    marginBottom: THEME.spacing.sm,
  },
  subtitle: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.xxxl,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: THEME.spacing.base,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.base,
    marginBottom: THEME.spacing.base,
    fontSize: THEME.typography.fontSize.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  button: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    alignItems: 'center',
    marginTop: THEME.spacing.sm,
  },
  buttonDisabled: {
    backgroundColor: THEME.colors.gray400,
  },
  buttonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  linkButton: {
    marginTop: THEME.spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
  },
  linkTextBold: {
    color: THEME.colors.primary,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  infoBox: {
    marginTop: THEME.spacing.xl,
    padding: THEME.spacing.base,
    backgroundColor: THEME.colors.gray100,
    borderRadius: THEME.borderRadius.base,
    borderWidth: 1,
    borderColor: THEME.colors.warning,
  },
  infoTitle: {
    fontSize: THEME.typography.fontSize.base,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.sm,
  },
  infoText: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.xs,
  },
});
