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
import { Collection } from '../../types';
import { LoadingSpinner, ErrorMessage } from '../../components';

type RootStackParamList = {
  CollectionForm: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CollectionsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getCollections({
        per_page: 50,
      });
      setCollections(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load collections');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCollections();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderCollectionItem = ({ item }: { item: Collection }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.supplierName}>{item.supplier?.name || 'Unknown Supplier'}</Text>
          <Text style={styles.productName}>{item.product?.name || 'Unknown Product'}</Text>
        </View>
        <Text style={styles.date}>{formatDate(item.collection_date)}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Quantity:</Text>
          <Text style={styles.detailValue}>
            {item.quantity} {item.unit}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Rate:</Text>
          <Text style={styles.detailValue}>
            ${(item.rate_applied || 0).toFixed(2)}/{item.unit}
          </Text>
        </View>
        <View style={[styles.detailRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>
            ${(item.total_amount || 0).toFixed(2)}
          </Text>
        </View>
      </View>

      {item.notes && (
        <Text style={styles.notes} numberOfLines={2}>
          Note: {item.notes}
        </Text>
      )}
    </View>
  );

  if (loading && collections.length === 0) {
    return <LoadingSpinner message="Loading collections..." />;
  }

  if (error && collections.length === 0) {
    return <ErrorMessage message={error} onRetry={fetchCollections} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={collections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCollectionItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No collections found</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CollectionForm')}
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
  supplierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    color: '#3498db',
  },
  date: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  detailsContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
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
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  notes: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 10,
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
    backgroundColor: '#27ae60',
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

export default CollectionsListScreen;
