import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useAppSelector } from '../hooks/redux';

export default function ProductsScreen() {
  const products = useAppSelector(state => state.products.items);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            {item.description && <Text style={styles.cardText}>{item.description}</Text>}
            <Text style={styles.cardText}>Base Rate: ${item.base_rate}</Text>
            {item.current_rate && item.current_rate !== item.base_rate && (
              <Text style={styles.cardTextHighlight}>Current Rate: ${item.current_rate}</Text>
            )}
            <Text style={styles.cardText}>Unit Type: {item.unit_type}</Text>
            <Text style={styles.cardText}>Status: {item.status}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products yet</Text>
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardTextHighlight: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
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
