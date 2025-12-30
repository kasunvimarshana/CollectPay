/**
 * Collections List Screen
 * Displays list of collections
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCollectionStore } from '../state/useCollectionStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { NetworkStatus } from '../components/NetworkStatus';

interface CollectionsScreenProps {
  navigation: any;
}

export const CollectionsScreen: React.FC<CollectionsScreenProps> = ({ navigation }) => {
  const { collections, isLoading, error, fetchCollections } = useCollectionStore();

  useEffect(() => {
    fetchCollections();
  }, []);

  if (isLoading && collections.length === 0) {
    return <Loading message="Loading collections..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <NetworkStatus />
      
      <View style={styles.header}>
        <Text style={styles.title}>Collections</Text>
        <Button
          title="Add Collection"
          onPress={() => navigation.navigate('CreateCollection')}
          style={styles.addButton}
        />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={collections}
        keyExtractor={(item) => item.getId()}
        renderItem={({ item }) => (
          <Card style={styles.collectionCard}>
            <View style={styles.collectionHeader}>
              <Text style={styles.collectionDate}>
                {item.getCollectionDate().toLocaleDateString()}
              </Text>
              <Text style={styles.amount}>
                {item.getTotalAmount().getCurrency()} {item.getTotalAmount().getAmount().toFixed(2)}
              </Text>
            </View>
            <Text style={styles.info}>
              📦 Quantity: {item.getQuantity().getValue()} {item.getQuantity().getUnit().toString()}
            </Text>
            {item.getNotes() && (
              <Text style={styles.notes} numberOfLines={2}>
                {item.getNotes()}
              </Text>
            )}
          </Card>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No collections found</Text>
            <Text style={styles.emptySubtext}>Add your first collection to get started</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  addButton: { paddingVertical: 8, paddingHorizontal: 16, minHeight: 40 },
  list: { padding: 16 },
  collectionCard: { marginBottom: 12 },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  collectionDate: { fontSize: 16, fontWeight: '600', color: '#333' },
  amount: { fontSize: 16, fontWeight: '700', color: '#FF9500' },
  info: { fontSize: 14, color: '#666', marginBottom: 4 },
  notes: { fontSize: 14, color: '#999', fontStyle: 'italic', marginTop: 4 },
  errorContainer: { backgroundColor: '#FFE5E5', padding: 12, margin: 16, borderRadius: 8 },
  errorText: { color: '#D32F2F', fontSize: 14 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#666', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#999' },
});
