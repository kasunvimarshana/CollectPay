import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      Alert.alert('Success', 'Logged in successfully!');
      // Navigation to home screen would happen here
    }
  };

  const fillTestCredentials = (role: 'admin' | 'collector' | 'viewer') => {
    const credentials = {
      admin: { email: 'admin@fieldsyncledger.com', password: 'password' },
      collector: { email: 'john@fieldsyncledger.com', password: 'password' },
      viewer: { email: 'viewer@fieldsyncledger.com', password: 'password' },
    };
    
    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>FieldSyncLedger</Text>
          <Text style={styles.subtitle}>Data Collection & Payment Management</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.testCredentials}>
            <Text style={styles.testLabel}>Test Credentials:</Text>
            <View style={styles.testButtons}>
              <TouchableOpacity
                style={styles.testButton}
                onPress={() => fillTestCredentials('admin')}
                disabled={loading}
              >
                <Text style={styles.testButtonText}>Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.testButton}
                onPress={() => fillTestCredentials('collector')}
                disabled={loading}
              >
                <Text style={styles.testButtonText}>Collector</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.testButton}
                onPress={() => fillTestCredentials('viewer')}
                disabled={loading}
              >
                <Text style={styles.testButtonText}>Viewer</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Offline-First Architecture</Text>
            <Text style={styles.footerText}>Automatic Synchronization</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 4,
    marginBottom: 20,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  loginButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#BBDEFB',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  testCredentials: {
    marginBottom: 30,
  },
  testLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  testButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  testButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  testButtonText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
});
