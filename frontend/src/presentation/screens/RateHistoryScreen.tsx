/**
 * Rate History Screen
 * Displays historical rates for a product
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import apiClient from '../../infrastructure/api/apiClient';
import { Rate } from '../../domain/entities/Product';

export const RateHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { productId, productName } = (route.params as any) || {};

  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRateHistory();
  }, [productId]);

  const loadRateHistory = async () => {
    try {
      const response = await apiClient.get<any>(`/products/${productId}/rate-history`);
      if (response.success && response.data) {
        const rateData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.data && Array.isArray(response.data.data) ? response.data.data : []);
        setRates(rateData);
      }
    } catch (error) {
      console.error('Error loading rate history:', error);
      Alert.alert('Error', 'Failed to load rate history');
    } finally {
      setLoading(false);
    }
  };

  const renderRateItem = ({ item }: { item: Rate }) => {
    const isActive = !item.effective_to || new Date(item.effective_to) > new Date();
    
    return (
      <View style={styles.rateCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.rateAmount}>{item.rate} per {item.unit}</Text>
          {isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Version:</Text>
            <Text style={styles.detailValue}>{item.version}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Effective From:</Text>
            <Text style={styles.detailValue}>
              {new Date(item.effective_from).toLocaleDateString()}
            </Text>
          </View>
          
          {item.effective_to && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Effective To:</Text>
              <Text style={styles.detailValue}>
                {new Date(item.effective_to).toLocaleDateString()}
              </Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created:</Text>
            <Text style={styles.detailValue}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading rate history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Rate History</Text>
        {productName && <Text style={styles.subtitle}>{productName}</Text>}
      </View>

      {rates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No rate history available</Text>
        </View>
      ) : (
        <FlatList
          data={rates}
          keyExtractor={(item, index) => item.id?.toString() || `rate-${index}`}
          renderItem={renderRateItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  rateCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  rateAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
