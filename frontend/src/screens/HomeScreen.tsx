import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const HomeScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TrackVault</Text>
        <Text style={styles.subtitle}>Data Collection & Payment Management</Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.label}>Logged in as:</Text>
        <Text style={styles.value}>{user?.name}</Text>
        <Text style={styles.value}>{user?.email}</Text>
        <Text style={styles.role}>Role: {user?.role?.toUpperCase()}</Text>
      </View>

      <View style={styles.features}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>✓ Multi-User Support</Text>
          <Text style={styles.featureText}>
            Concurrent access for multiple users across devices
          </Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>✓ Data Integrity</Text>
          <Text style={styles.featureText}>
            Version control prevents conflicts and data corruption
          </Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>✓ Multi-Unit Tracking</Text>
          <Text style={styles.featureText}>
            Support for kg, g, liters, and custom units
          </Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>✓ Automated Calculations</Text>
          <Text style={styles.featureText}>
            Automatic payment calculations based on rates and collections
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },
  userInfo: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  role: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
    marginTop: 10,
  },
  features: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
