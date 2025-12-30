/**
 * Home Screen
 * Main dashboard of the application
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { NetworkStatus } from '../components/NetworkStatus';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const menuItems = [
    { title: 'Suppliers', icon: '👥', route: 'Suppliers', color: '#007AFF' },
    { title: 'Products', icon: '📦', route: 'Products', color: '#34C759' },
    { title: 'Collections', icon: '📊', route: 'Collections', color: '#FF9500' },
    { title: 'Payments', icon: '💰', route: 'Payments', color: '#AF52DE' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <NetworkStatus />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>FieldPay Ledger</Text>
          <Text style={styles.subtitle}>Data Collection & Payment Management</Text>
        </View>

        <View style={styles.grid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.route)}
            >
              <Card style={StyleSheet.flatten([styles.menuCard, { borderLeftColor: item.color }])}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.info}>
          <Text style={styles.infoText}>
            Clean Architecture • SOLID Principles • Offline Support
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  grid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    marginBottom: 16,
  },
  menuCard: {
    alignItems: 'center',
    paddingVertical: 24,
    borderLeftWidth: 4,
  },
  menuIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  info: {
    padding: 24,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
