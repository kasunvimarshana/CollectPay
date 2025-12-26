import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { apiClient } from '../../src/api/client';
import { localDb } from '../../src/database/localDb';
import { useNetworkStore } from '../../src/store/networkStore';
import { Payment } from '../../src/types';
import { format } from 'date-fns';

export default function PaymentsScreen() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { isConnected } = useNetworkStore();

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      if (isConnected) {
        // Try to fetch from server
        const response = await apiClient.get('/payments');
        const serverPayments = response.data || response;
        setPayments(serverPayments);

        // Update local cache
        for (const payment of serverPayments) {
          await localDb.savePayment(payment);
        }
      } else {
        // Load from local database - get unsynced payments
        const localPayments = await localDb.getUnsyncedPayments();
        setPayments(localPayments);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      // Fallback to local data
      const localPayments = await localDb.getUnsyncedPayments();
      setPayments(localPayments);
      if (localPayments.length === 0) {
        Alert.alert('Error', 'Failed to load payments');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    // Would need supplier names for better search
    return true; // For now, show all
  });

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'advance':
        return '#3498db';
      case 'partial':
        return '#f39c12';
      case 'full':
        return '#27ae60';
      case 'adjustment':
        return '#9b59b6';
      default:
        return '#95a5a6';
    }
  };

  const renderPayment = ({ item }: { item: Payment }) => (
    <TouchableOpacity
      style={styles.paymentCard}
      onPress={() =>
        Alert.alert('Payment', `View details for payment ${item.uuid}`)
      }
    >
      <View style={styles.paymentHeader}>
        <Text style={styles.supplierText}>Supplier ID: {item.supplier_id}</Text>
        <View
          style={[
            styles.syncBadge,
            item.synced_at ? styles.synced : styles.pending,
          ]}
        >
          <Text style={styles.syncText}>
            {item.synced_at ? 'Synced' : 'Pending'}
          </Text>
        </View>
      </View>
      
      <View style={styles.detailsRow}>
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: getPaymentTypeColor(item.payment_type) },
          ]}
        >
          <Text style={styles.typeText}>
            {item.payment_type.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.methodText}>{item.payment_method}</Text>
      </View>

      <Text style={styles.amountText}>Amount: ${item.amount.toFixed(2)}</Text>
      <Text style={styles.dateText}>
        Date: {format(new Date(item.payment_date), 'MMM dd, yyyy')}
      </Text>
      
      {item.reference_number && (
        <Text style={styles.refText}>Ref: {item.reference_number}</Text>
      )}
      
      {item.notes && <Text style={styles.notesText}>Notes: {item.notes}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payments</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => Alert.alert('Coming Soon', 'Add payment feature')}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search payments..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            Offline Mode - Showing local data
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      ) : (
        <FlatList
          data={filteredPayments}
          renderItem={renderPayment}
          keyExtractor={(item) => item.uuid}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={loadPayments}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No payments found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#3498db',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#3498db',
    fontWeight: '600',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: 'white',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  offlineBanner: {
    backgroundColor: '#f39c12',
    padding: 10,
    alignItems: 'center',
  },
  offlineText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 15,
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
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
    marginBottom: 8,
  },
  supplierText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  syncBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  synced: {
    backgroundColor: '#27ae60',
  },
  pending: {
    backgroundColor: '#f39c12',
  },
  syncText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  typeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  methodText: {
    fontSize: 14,
    color: '#7f8c8d',
    textTransform: 'capitalize',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#95a5a6',
    marginBottom: 4,
  },
  refText: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#95a5a6',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
});
