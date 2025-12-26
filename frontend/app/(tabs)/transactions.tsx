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
import { Transaction } from '../../src/types';
import { format } from 'date-fns';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { isConnected } = useNetworkStore();

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      if (isConnected) {
        // Try to fetch from server
        const response = await apiClient.get('/transactions');
        const serverTransactions = response.data || response;
        setTransactions(serverTransactions);

        // Update local cache
        for (const transaction of serverTransactions) {
          await localDb.saveTransaction(transaction);
        }
      } else {
        // Load from local database - get all transactions
        const localTransactions = await localDb.getUnsyncedTransactions();
        // Would need a method to get all transactions, not just unsynced
        setTransactions(localTransactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      // Fallback to local data
      const localTransactions = await localDb.getUnsyncedTransactions();
      setTransactions(localTransactions);
      if (localTransactions.length === 0) {
        Alert.alert('Error', 'Failed to load transactions');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    // Would need supplier and product names for better search
    return true; // For now, show all
  });

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() =>
        Alert.alert('Transaction', `View details for transaction ${item.uuid}`)
      }
    >
      <View style={styles.transactionHeader}>
        <Text style={styles.supplierText}>
          Supplier ID: {item.supplier_id}
        </Text>
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
      <Text style={styles.productText}>Product ID: {item.product_id}</Text>
      <View style={styles.detailsRow}>
        <Text style={styles.detailText}>
          Quantity: {item.quantity} {item.unit}
        </Text>
        <Text style={styles.detailText}>Rate: ${item.rate}</Text>
      </View>
      <Text style={styles.amountText}>Amount: ${item.amount.toFixed(2)}</Text>
      <Text style={styles.dateText}>
        Date:{' '}
        {format(new Date(item.transaction_date), 'MMM dd, yyyy')}
      </Text>
      {item.notes && <Text style={styles.notesText}>Notes: {item.notes}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Collections</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            Alert.alert('Coming Soon', 'Add transaction feature')
          }
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
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
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.uuid}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={loadTransactions}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions found</Text>
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
  transactionCard: {
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
  transactionHeader: {
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
  productText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#95a5a6',
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
