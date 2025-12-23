import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useAppSelector } from '../hooks/redux';
import { format } from 'date-fns';

export default function CollectionsScreen() {
  const collections = useAppSelector(state => state.collections.items);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Collections</Text>
      </View>
      <FlatList
        data={collections}
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
            <Text style={styles.cardText}>
              Product: {item.product?.name || `Product #${item.product_id}`}
            </Text>
            <Text style={styles.cardText}>
              Quantity: {item.quantity} {item.unit}
            </Text>
            <View style={styles.rateSection}>
              <Text style={styles.cardText}>Rate at collection: ${item.rate}</Text>
              {item.product?.current_rate && item.product.current_rate !== item.rate && (
                <Text style={styles.cardTextWarning}>
                  ⚠ Current rate: ${item.product.current_rate}
                </Text>
              )}
            </View>
            <Text style={styles.cardAmount}>Total: ${item.total_amount}</Text>
            <Text style={styles.cardDate}>
              {format(new Date(item.collection_date), 'PPp')}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No collections yet</Text>
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
  cardText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  rateSection: {
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  cardTextWarning: {
    fontSize: 13,
    color: '#FF9500',
    fontStyle: 'italic',
    marginBottom: 4,
    marginLeft: 10,
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 4,
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
