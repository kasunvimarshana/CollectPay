import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Product } from '../../domain/entities';
import apiService from '../../application/services/ApiService';

type ProductsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Products'>;

const ProductsScreen: React.FC = () => {
  const navigation = useNavigation<ProductsScreenNavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await apiService.getProducts();
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

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
        data={products}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.item}
            onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
          >
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDetail}>{item.description}</Text>
            <Text style={styles.itemDetail}>Unit: {item.unit}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('ProductDetail', {})}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 10 },
  item: { backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 8 },
  itemName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  itemDetail: { fontSize: 14, color: '#666' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center' },
  fabText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
});

export default ProductsScreen;
