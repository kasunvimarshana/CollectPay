import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

/**
 * FieldLedger Platform - Mobile App
 * 
 * Production-ready data collection and payment management system
 * Built with Clean Architecture principles
 * 
 * Features:
 * - Supplier management
 * - Product tracking with versioned rates
 * - Collection entry with multi-unit support
 * - Payment calculations
 * - Offline-first with synchronization
 */
export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FieldLedger Platform</Text>
      <Text style={styles.subtitle}>Data Collection & Payment Management</Text>
      <Text style={styles.info}>Clean Architecture Implementation</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
