import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { paymentAPI } from '../api';

const PaymentsScreen = ({ navigation }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Add "Add" button to navigation header
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('PaymentForm')}
          style={{ marginRight: 15 }}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+</Text>
        </TouchableOpacity>
      ),
    });
    
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPayments = async () => {
    try {
      const response = await paymentAPI.getAll({ per_page: 50 });
      setPayments(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load payments');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'advance': return '#2196f3';
      case 'partial': return '#ff9800';
      case 'full': return '#4caf50';
      default: return '#666';
    }
  };

  const renderPayment = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.supplierName}>{item.supplier?.name || 'N/A'}</Text>
        <Text style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
          {item.type.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.date}>Date: {formatDate(item.payment_date)}</Text>
      {item.reference_number && (
        <Text style={styles.reference}>Ref: {item.reference_number}</Text>
      )}
      <View style={styles.amountBox}>
        <Text style={styles.amountLabel}>Amount Paid:</Text>
        <Text style={styles.amount}>${item.amount}</Text>
      </View>
      {item.notes && <Text style={styles.notes}>Notes: {item.notes}</Text>}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={payments}
        renderItem={renderPayment}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No payments found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  reference: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  amountBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff3e0',
    borderRadius: 6,
    marginTop: 5,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e65100',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e65100',
  },
  notes: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default PaymentsScreen;
