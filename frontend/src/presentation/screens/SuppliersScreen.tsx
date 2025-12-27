import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Supplier } from '../../domain/entities';
import apiService from '../../application/services/ApiService';

type SuppliersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Suppliers'>;

const SuppliersScreen: React.FC = () => {
  const navigation = useNavigation<SuppliersScreenNavigationProp>();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const response = await apiService.getSuppliers();
      if (response.success && response.data) {
        setSuppliers(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load suppliers');
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Supplier }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('SupplierDetail', { id: item.id })}
    >
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemDetail}>{item.contactPerson}</Text>
      <Text style={styles.itemDetail}>{item.phone}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={suppliers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('SupplierDetail', {})}
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
  list: {
    padding: 10,
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
});

export default SuppliersScreen;
