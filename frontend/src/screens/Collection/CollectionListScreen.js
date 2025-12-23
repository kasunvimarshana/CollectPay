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

const CollectionListScreen = ({ navigation }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { isConnected } = useNetwork();

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const db = await getDatabase();
      // Load collections with supplier names
      const query = `
        SELECT c.*, s.name as supplier_name, p.name as product_name
        FROM collections c
        LEFT JOIN suppliers s ON c.supplier_id = s.id
        LEFT JOIN products p ON c.product_id = p.id
        ORDER BY c.collection_date DESC
      `;
      const results = await db.getAllAsync(query);
      setCollections(results);
    } catch (error) {
      console.error('Error loading collections:', error);
      Alert.alert('Error', 'Failed to load collections');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCollections();
  }, []);

  const renderCollection = ({ item }) => (
    <TouchableOpacity
      style={styles.collectionCard}
      onPress={() => navigation.navigate('CollectionDetail', { collectionId: item.id })}
    >
      <View style={styles.collectionHeader}>
        <Text style={styles.supplierName}>{item.supplier_name || 'Unknown Supplier'}</Text>
        {!item.is_synced && (
          <View style={styles.unsyncedBadge}>
            <Text style={styles.unsyncedText}>●</Text>
          </View>
        )}
      </View>
      <Text style={styles.productName}>{item.product_name || 'Unknown Product'}</Text>
      <View style={styles.collectionDetails}>
        <Text style={styles.detailText}>
          Quantity: {item.quantity} {item.unit}
        </Text>
        <Text style={styles.detailText}>
          Rate: LKR {(item.rate || 0).toFixed(2)}/{item.unit}
        </Text>
      </View>
      <View style={styles.collectionFooter}>
        <Text style={styles.dateText}>
          {new Date(item.collection_date).toLocaleDateString()}
        </Text>
        <Text style={styles.amountText}>
          LKR {(item.total_amount || 0).toFixed(2)}
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
        <Text style={styles.title}>Collections</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, isConnected ? styles.online : styles.offline]} />
          <Text style={styles.statusText}>{isConnected ? 'Online' : 'Offline'}</Text>
        </View>
      </View>

      <FlatList
        data={collections}
        renderItem={renderCollection}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No collections found</Text>
            <Text style={styles.emptySubtext}>Add your first collection</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateCollection')}
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
  collectionCard: {
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
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
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
  productName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  collectionDetails: {
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  collectionFooter: {
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

export default CollectionListScreen;
