/**
 * Login Screen
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import THEME from '../../core/constants/theme';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const goToRegister = () => {
    (navigation.navigate as any)('Register');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.content, { paddingTop: insets.top + THEME.spacing.lg, paddingBottom: insets.bottom + THEME.spacing.lg }]}>
        <Text style={styles.title} accessibilityRole="header">CollectPay</Text>
        <Text style={styles.subtitle}>Data Collection & Payment Management</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Email address"
            accessibilityHint="Enter your email address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            accessibilityLabel="Password"
            accessibilityHint="Enter your password"
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Login"
            accessibilityHint="Press to log in to your account"
            accessibilityState={{ disabled: isLoading, busy: isLoading }}
          >
            {isLoading ? (
              <ActivityIndicator color={THEME.colors.white} />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={goToRegister}
            accessibilityRole="button"
            accessibilityLabel="Register"
            accessibilityHint="Navigate to registration screen"
          >
            <Text style={styles.linkText}>
              Don't have an account? <Text style={styles.linkTextBold}>Register</Text>
            </Text>
          </TouchableOpacity>

          {/* <View style={styles.testCredentials}>
            <Text style={styles.testCredentialsTitle}>Test Credentials:</Text>
            <Text style={styles.testCredentialsText}>Admin: admin@email.com / password</Text>
            <Text style={styles.testCredentialsText}>Collector: collector@email.com / password</Text>
          </View> */}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: THEME.spacing.lg,
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
  testCredentials: {
    marginTop: THEME.spacing.xl,
    padding: THEME.spacing.base,
    backgroundColor: THEME.colors.gray100,
    borderRadius: THEME.borderRadius.base,
  },
  testCredentialsTitle: {
    fontSize: THEME.typography.fontSize.base,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.sm,
  },
  testCredentialsText: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.xs,
  },
});
