import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNetwork } from '../../context/NetworkContext';
import { getDatabase } from '../../database/init';

const PaymentListScreen = ({ navigation }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { isConnected } = useNetwork();

  const canCreatePayment = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const db = await getDatabase();
      // Load payments with supplier names
      const query = `
        SELECT p.*, s.name as supplier_name
        FROM payments p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        ORDER BY p.payment_date DESC
      `;
      const results = await db.getAllAsync(query);
      setPayments(results);
    } catch (error) {
      console.error('Error loading payments:', error);
      Alert.alert('Error', 'Failed to load payments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPayments();
  }, []);

  const getPaymentTypeLabel = (type) => {
    const labels = {
      advance: 'Advance',
      partial: 'Partial',
      full: 'Full Payment',
      adjustment: 'Adjustment',
    };
    return labels[type] || type;
  };

  const renderPayment = ({ item }) => (
    <TouchableOpacity
      style={styles.paymentCard}
      onPress={() => navigation.navigate('PaymentDetail', { paymentId: item.id })}
    >
      <View style={styles.paymentHeader}>
        <Text style={styles.supplierName}>{item.supplier_name || 'Unknown Supplier'}</Text>
        {!item.is_synced && (
          <View style={styles.unsyncedBadge}>
            <Text style={styles.unsyncedText}>●</Text>
          </View>
        )}
      </View>
      <View style={styles.paymentDetails}>
        <View style={[styles.typeBadge, styles[`type_${item.payment_type}`]]}>
          <Text style={styles.typeText}>{getPaymentTypeLabel(item.payment_type)}</Text>
        </View>
        {item.reference && (
          <Text style={styles.referenceText}>Ref: {item.reference}</Text>
        )}
      </View>
      <View style={styles.paymentFooter}>
        <Text style={styles.dateText}>
          {new Date(item.payment_date).toLocaleDateString()}
        </Text>
        <Text style={styles.amountText}>
          LKR {(item.amount || 0).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payments</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, isConnected ? styles.online : styles.offline]} />
          <Text style={styles.statusText}>{isConnected ? 'Online' : 'Offline'}</Text>
        </View>
      </View>

      <FlatList
        data={payments}
        renderItem={renderPayment}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No payments found</Text>
            <Text style={styles.emptySubtext}>Record your first payment</Text>
          </View>
        }
      />

      {canCreatePayment && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreatePayment')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
  },
  listContent: {
    padding: 15,
  },
  paymentCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  unsyncedBadge: {
    marginLeft: 10,
  },
  unsyncedText: {
    color: '#FF9800',
    fontSize: 16,
  },
  paymentDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 10,
  },
  type_advance: {
    backgroundColor: '#E3F2FD',
  },
  type_partial: {
    backgroundColor: '#FFF3E0',
  },
  type_full: {
    backgroundColor: '#E8F5E9',
  },
  type_adjustment: {
    backgroundColor: '#F3E5F5',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  referenceText: {
    fontSize: 12,
    color: '#999',
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PaymentListScreen;
