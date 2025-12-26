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
import { collectionAPI } from '../api';

const CollectionsScreen = ({ navigation }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Add "Add" button to navigation header
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('CollectionForm')}
          style={{ marginRight: 15 }}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+</Text>
        </TouchableOpacity>
      ),
    });
    
    loadCollections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCollections = async () => {
    try {
      const response = await collectionAPI.getAll({ per_page: 50 });
      setCollections(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load collections');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadCollections();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderCollection = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.supplierName}>{item.supplier?.name || 'N/A'}</Text>
        <Text style={styles.date}>{formatDate(item.collection_date)}</Text>
      </View>
      <Text style={styles.product}>Product: {item.product?.name || 'N/A'}</Text>
      <View style={styles.details}>
        <Text style={styles.quantity}>
          Quantity: {item.quantity} {item.unit}
        </Text>
        <Text style={styles.rate}>Rate: ${item.rate_applied}/{item.unit}</Text>
      </View>
      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>Total Amount:</Text>
        <Text style={styles.totalAmount}>${item.total_amount}</Text>
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
        data={collections}
        renderItem={renderCollection}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No collections found</Text>
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
  date: {
    fontSize: 14,
    color: '#666',
  },
  product: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  quantity: {
    fontSize: 14,
    color: '#333',
  },
  rate: {
    fontSize: 14,
    color: '#333',
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e8f5e9',
    borderRadius: 6,
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
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

export default CollectionsScreen;
