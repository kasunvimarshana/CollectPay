/**
 * Supplier Detail Screen
 * Shows detailed information about a supplier including balance, collections, and payments
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
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import apiClient from '../../infrastructure/api/apiClient';
import { Supplier } from '../../domain/entities/Supplier';
import { useAuth } from '../contexts/AuthContext';
import { canUpdate, canDelete } from '../../core/utils/permissions';

export const SupplierDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const supplierId = (route.params as any)?.supplierId;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [balance, setBalance] = useState<any>(null);

  useEffect(() => {
    if (supplierId) {
      loadSupplierData();
    }
  }, [supplierId]);

  const loadSupplierData = async () => {
    try {
      setLoading(true);
      
      // Load supplier details and balance in parallel
      const [supplierResponse, balanceResponse] = await Promise.all([
        apiClient.get<any>(`/suppliers/${supplierId}`),
        apiClient.get<any>(`/suppliers/${supplierId}/balance`),
      ]);

      if (supplierResponse.success && supplierResponse.data) {
        setSupplier(supplierResponse.data);
      }

      if (balanceResponse.success && balanceResponse.data) {
        setBalance(balanceResponse.data);
      }
    } catch (error) {
      console.error('Error loading supplier data:', error);
      Alert.alert('Error', 'Failed to load supplier details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSupplierData();
    setRefreshing(false);
  };

  const handleEdit = () => {
    (navigation.navigate as any)('SupplierForm', { supplierId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this supplier? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/suppliers/${supplierId}`);
              Alert.alert('Success', 'Supplier deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting supplier:', error);
              Alert.alert('Error', 'Failed to delete supplier');
            }
          },
        },
      ]
    );
  };

  const handleViewCollections = () => {
    // Navigate to collections list filtered by this supplier
    Alert.alert('Coming Soon', 'Collections view will be available soon');
  };

  const handleViewPayments = () => {
    // Navigate to payments list filtered by this supplier
    Alert.alert('Coming Soon', 'Payments view will be available soon');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading supplier details...</Text>
      </View>
    );
  }

  if (!supplier) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Supplier not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header with action buttons */}
      <View style={styles.header}>
        <View style={styles.headerActions}>
          {canUpdate(user, 'suppliers') && (
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
          {canDelete(user, 'suppliers') && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Supplier Info Card */}
      <View style={styles.card}>
        <View style={styles.nameRow}>
          <Text style={styles.supplierName}>{supplier.name}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: supplier.is_active ? '#4CAF50' : '#F44336' }
          ]}>
            <Text style={styles.statusText}>
              {supplier.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Code:</Text>
          <Text style={styles.infoValue}>{supplier.code}</Text>
        </View>

        {supplier.contact_person && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contact Person:</Text>
            <Text style={styles.infoValue}>{supplier.contact_person}</Text>
          </View>
        )}

        {supplier.phone && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{supplier.phone}</Text>
          </View>
        )}

        {supplier.email && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{supplier.email}</Text>
          </View>
        )}

        {supplier.address && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>{supplier.address}</Text>
          </View>
        )}

        {supplier.region && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Region:</Text>
            <Text style={styles.infoValue}>{supplier.region}</Text>
          </View>
        )}
      </View>

      {/* Balance Card */}
      {balance && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Financial Summary</Text>
          
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Total Collections:</Text>
            <Text style={styles.balanceValue}>
              ${balance.total_collection_amount?.toFixed(2) || '0.00'}
            </Text>
          </View>

          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Total Payments:</Text>
            <Text style={styles.balanceValue}>
              ${balance.total_payments?.toFixed(2) || '0.00'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabelBold}>Outstanding Balance:</Text>
            <Text style={[
              styles.balanceValueBold,
              { color: balance.balance > 0 ? '#F44336' : '#4CAF50' }
            ]}>
              ${Math.abs(balance.balance || 0).toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleViewCollections}
        >
          <Text style={styles.actionButtonText}>View Collections</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleViewPayments}
        >
          <Text style={styles.actionButtonText}>View Payments</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F44336',
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#F44336',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  supplierName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    width: 120,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  balanceValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  balanceLabelBold: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  balanceValueBold: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  actionButton: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
