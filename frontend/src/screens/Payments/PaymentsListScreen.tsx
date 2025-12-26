import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import apiService from '../../services/api';
import { Payment } from '../../types';
import { LoadingSpinner, ErrorMessage } from '../../components';

type RootStackParamList = {
  PaymentForm: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PaymentsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getPayments({
        per_page: 50,
      });
      setPayments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'advance':
        return '#3498db';
      case 'partial':
        return '#f39c12';
      case 'full':
        return '#27ae60';
      default:
        return '#95a5a6';
    }
  };

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.supplierName}>{item.supplier?.name || 'Unknown Supplier'}</Text>
          <View style={[styles.typeBadge, { backgroundColor: getPaymentTypeColor(item.payment_type) }]}>
            <Text style={styles.typeBadgeText}>{item.payment_type.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
          <Text style={styles.date}>{formatDate(item.payment_date)}</Text>
        </View>
      </View>

      {item.payment_method && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Method:</Text>
          <Text style={styles.detailValue}>{item.payment_method}</Text>
        </View>
      )}

      {item.reference_number && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Reference:</Text>
          <Text style={styles.detailValue}>{item.reference_number}</Text>
        </View>
      )}

      {item.notes && (
        <Text style={styles.notes} numberOfLines={2}>
          Note: {item.notes}
        </Text>
      )}
    </View>
  );

  if (loading && payments.length === 0) {
    return <LoadingSpinner message="Loading payments..." />;
  }

  if (error && payments.length === 0) {
    return <ErrorMessage message={error} onRetry={fetchPayments} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPaymentItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No payments found</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PaymentForm')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  supplierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  amount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  notes: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#9b59b6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PaymentsListScreen;
