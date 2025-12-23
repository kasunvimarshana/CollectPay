import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getDatabase } from '../../database/init';

const SupplierDetailScreen = ({ navigation, route }) => {
  const { supplierId } = route.params;
  const [supplier, setSupplier] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSupplierDetails();
  }, [supplierId]);

  const loadSupplierDetails = async () => {
    try {
      const db = await getDatabase();
      
      // Load supplier
      const supplierData = await db.getFirstAsync(
        'SELECT * FROM suppliers WHERE id = ?',
        [supplierId]
      );
      setSupplier(supplierData);

      // Calculate balance (total collections - total payments)
      const collectionsTotal = await db.getFirstAsync(
        'SELECT SUM(total_amount) as total FROM collections WHERE supplier_id = ?',
        [supplierId]
      );
      
      const paymentsTotal = await db.getFirstAsync(
        'SELECT SUM(amount) as total FROM payments WHERE supplier_id = ?',
        [supplierId]
      );

      const balance = (collectionsTotal?.total || 0) - (paymentsTotal?.total || 0);
      setBalance(balance);

      // Load recent transactions
      const recentCollections = await db.getAllAsync(
        'SELECT * FROM collections WHERE supplier_id = ? ORDER BY collection_date DESC LIMIT 5',
        [supplierId]
      );

      const recentPayments = await db.getAllAsync(
        'SELECT * FROM payments WHERE supplier_id = ? ORDER BY payment_date DESC LIMIT 5',
        [supplierId]
      );

      setTransactions([...recentCollections, ...recentPayments].sort((a, b) => {
        const dateA = new Date(a.collection_date || a.payment_date);
        const dateB = new Date(b.collection_date || b.payment_date);
        return dateB - dateA;
      }).slice(0, 10));

    } catch (error) {
      console.error('Error loading supplier details:', error);
      Alert.alert('Error', 'Failed to load supplier details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Supplier',
      'Are you sure you want to delete this supplier? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = await getDatabase();
              await db.runAsync('DELETE FROM suppliers WHERE id = ?', [supplierId]);
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!supplier) {
    return (
      <View style={styles.centerContainer}>
        <Text>Supplier not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{supplier.name}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={[styles.balanceAmount, balance < 0 && styles.negativeBalance]}>
            LKR {balance.toFixed(2)}
          </Text>
          <Text style={styles.balanceNote}>
            {balance > 0 ? 'Amount owed to supplier' : balance < 0 ? 'Overpayment' : 'Settled'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{supplier.email || 'Not provided'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{supplier.phone || 'Not provided'}</Text>
          </View>
          {supplier.location && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{supplier.location}</Text>
            </View>
          )}
        </View>

        {supplier.metadata && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <Text style={styles.metadata}>{supplier.metadata}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactions.length > 0 ? (
            transactions.map((transaction, index) => (
              <View key={index} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <Text style={styles.transactionType}>
                    {transaction.collection_date ? 'Collection' : 'Payment'}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.collection_date || transaction.payment_date).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.transactionAmount}>
                  {transaction.collection_date ? '+' : '-'} LKR {(transaction.total_amount || transaction.amount || 0).toFixed(2)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No transactions yet</Text>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('AddEditSupplier', { supplierId })}
          >
            <Text style={styles.editButtonText}>Edit Supplier</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Delete Supplier</Text>
          </TouchableOpacity>
        </View>
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
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 15,
  },
  balanceCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  negativeBalance: {
    color: '#F44336',
  },
  balanceNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  metadata: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  transactionCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 10,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
  },
  actions: {
    marginTop: 20,
  },
  editButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SupplierDetailScreen;
