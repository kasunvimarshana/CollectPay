/**
 * Suppliers List Screen
 * Displays list of suppliers
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSupplierStore } from '../state/useSupplierStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';

interface SuppliersScreenProps {
  navigation: any;
}

export const SuppliersScreen: React.FC<SuppliersScreenProps> = ({ navigation }) => {
  const { suppliers, isLoading, error, fetchSuppliers } = useSupplierStore();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  if (isLoading && suppliers.length === 0) {
    return <Loading message="Loading suppliers..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Suppliers</Text>
        <Button
          title="Add Supplier"
          onPress={() => navigation.navigate('CreateSupplier')}
          style={styles.addButton}
        />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={suppliers}
        keyExtractor={(item) => item.getId()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('SupplierDetail', { id: item.getId() })}
          >
            <Card style={styles.supplierCard}>
              <View style={styles.supplierHeader}>
                <Text style={styles.supplierName}>{item.getName()}</Text>
                <Text style={styles.supplierCode}>{item.getCode()}</Text>
              </View>
              <Text style={styles.supplierInfo}>📧 {item.getEmail()}</Text>
              <Text style={styles.supplierInfo}>📱 {item.getPhone()}</Text>
              <Text style={styles.supplierInfo}>📍 {item.getAddress()}</Text>
            </Card>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No suppliers found</Text>
            <Text style={styles.emptySubtext}>Add your first supplier to get started</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 40,
  },
  list: {
    padding: 16,
  },
  supplierCard: {
    marginBottom: 12,
  },
  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  supplierCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    backgroundColor: '#E3F2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  supplierInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});
