import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useAppSelector } from '../hooks/redux';
import { format } from 'date-fns';

export default function PaymentsScreen() {
  const payments = useAppSelector(state => state.payments.items);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payments</Text>
      </View>
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                {item.supplier?.name || `Supplier #${item.supplier_id}`}
              </Text>
              <View style={[
                styles.badge,
                item.sync_status === 'synced' ? styles.badgeSynced : styles.badgePending
              ]}>
                <Text style={styles.badgeText}>{item.sync_status}</Text>
              </View>
            </View>
            <Text style={styles.cardAmount}>${item.amount}</Text>
            <Text style={styles.cardText}>Type: {item.payment_type}</Text>
            <Text style={styles.cardText}>Method: {item.payment_method}</Text>
            {item.reference_number && (
              <Text style={styles.cardText}>Ref: {item.reference_number}</Text>
            )}
            <Text style={styles.cardDate}>
              {format(new Date(item.payment_date), 'PPp')}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No payments yet</Text>
          </View>
        }
      />
    </View>
  );
}

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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  cardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeSynced: {
    backgroundColor: '#34C759',
  },
  badgePending: {
    backgroundColor: '#FF9500',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
