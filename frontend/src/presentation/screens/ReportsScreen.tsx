/**
 * Reports Screen
 * Display analytics and summary reports for collections and payments
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../infrastructure/api/apiClient';
import { useAuth } from '../contexts/AuthContext';

interface ReportSummary {
  totalSuppliers: number;
  activeSuppliers: number;
  totalProducts: number;
  activeProducts: number;
  totalCollections: number;
  totalCollectionAmount: number;
  totalPayments: number;
  totalPaymentAmount: number;
  outstandingBalance: number;
  collectionsThisMonth: number;
  paymentsThisMonth: number;
}

interface SupplierBalance {
  supplier_id: number;
  supplier_name: string;
  supplier_code: string;
  total_collections: number;
  total_payments: number;
  balance: number;
}

export const ReportsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [topBalances, setTopBalances] = useState<SupplierBalance[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSummary(),
        loadTopBalances(),
      ]);
    } catch (error) {
      console.error('Error loading reports:', error);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      // Load summary data from multiple endpoints
      const [suppliersRes, productsRes, collectionsRes, paymentsRes] = await Promise.all([
        apiClient.get<any>('/suppliers?per_page=1'),
        apiClient.get<any>('/products?per_page=1'),
        apiClient.get<any>('/collections?per_page=1'),
        apiClient.get<any>('/payments?per_page=1'),
      ]);

      // Calculate summary from paginated responses
      const totalSuppliers = suppliersRes.data?.total || 0;
      const totalProducts = productsRes.data?.total || 0;
      const totalCollections = collectionsRes.data?.total || 0;
      const totalPayments = paymentsRes.data?.total || 0;

      // Get full data for calculations
      const [allCollections, allPayments] = await Promise.all([
        apiClient.get<any>('/collections?per_page=1000'),
        apiClient.get<any>('/payments?per_page=1000'),
      ]);

      const collections = allCollections.data?.data || [];
      const payments = allPayments.data?.data || [];

      const totalCollectionAmount = collections.reduce(
        (sum: number, c: any) => sum + (parseFloat(c.total_amount) || 0),
        0
      );
      const totalPaymentAmount = payments.reduce(
        (sum: number, p: any) => sum + (parseFloat(p.amount) || 0),
        0
      );

      const outstandingBalance = totalCollectionAmount - totalPaymentAmount;

      // Calculate this month's data
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const collectionsThisMonth = collections.filter(
        (c: any) => new Date(c.collection_date) >= firstDayOfMonth
      ).length;
      
      const paymentsThisMonth = payments.filter(
        (p: any) => new Date(p.payment_date) >= firstDayOfMonth
      ).length;

      setSummary({
        totalSuppliers,
        activeSuppliers: totalSuppliers, // Could be filtered by is_active
        totalProducts,
        activeProducts: totalProducts, // Could be filtered by is_active
        totalCollections,
        totalCollectionAmount,
        totalPayments,
        totalPaymentAmount,
        outstandingBalance,
        collectionsThisMonth,
        paymentsThisMonth,
      });
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const loadTopBalances = async () => {
    try {
      // Get all suppliers with their balances
      const response = await apiClient.get<any>('/suppliers?per_page=1000');
      const suppliers = response.data?.data || [];

      // Get balance for each supplier
      const balancePromises = suppliers.slice(0, 10).map(async (supplier: any) => {
        try {
          const balanceRes = await apiClient.get<any>(`/suppliers/${supplier.id}/balance`);
          return {
            supplier_id: supplier.id,
            supplier_name: supplier.name,
            supplier_code: supplier.code,
            total_collections: balanceRes.data?.total_collections || 0,
            total_payments: balanceRes.data?.total_payments || 0,
            balance: balanceRes.data?.balance || 0,
          };
        } catch (error) {
          return null;
        }
      });

      const balances = (await Promise.all(balancePromises))
        .filter((b): b is SupplierBalance => b !== null)
        .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
        .slice(0, 5);

      setTopBalances(balances);
    } catch (error) {
      console.error('Error loading top balances:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const goBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Reports & Analytics</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          
          <View style={styles.cardRow}>
            <View style={[styles.card, styles.cardBlue]}>
              <Text style={styles.cardValue}>{summary?.totalSuppliers || 0}</Text>
              <Text style={styles.cardLabel}>Total Suppliers</Text>
            </View>
            <View style={[styles.card, styles.cardGreen]}>
              <Text style={styles.cardValue}>{summary?.totalProducts || 0}</Text>
              <Text style={styles.cardLabel}>Total Products</Text>
            </View>
          </View>

          <View style={styles.cardRow}>
            <View style={[styles.card, styles.cardOrange]}>
              <Text style={styles.cardValue}>{summary?.totalCollections || 0}</Text>
              <Text style={styles.cardLabel}>Total Collections</Text>
            </View>
            <View style={[styles.card, styles.cardPurple]}>
              <Text style={styles.cardValue}>{summary?.totalPayments || 0}</Text>
              <Text style={styles.cardLabel}>Total Payments</Text>
            </View>
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          
          <View style={styles.financialCard}>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Total Collections:</Text>
              <Text style={styles.financialValue}>
                ${summary?.totalCollectionAmount.toFixed(2) || '0.00'}
              </Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Total Payments:</Text>
              <Text style={[styles.financialValue, styles.textGreen]}>
                ${summary?.totalPaymentAmount.toFixed(2) || '0.00'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.financialRow}>
              <Text style={styles.financialLabelBold}>Outstanding Balance:</Text>
              <Text style={[styles.financialValueBold, 
                (summary?.outstandingBalance || 0) > 0 ? styles.textRed : styles.textGreen
              ]}>
                ${Math.abs(summary?.outstandingBalance || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* This Month */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month</Text>
          
          <View style={styles.cardRow}>
            <View style={[styles.card, styles.cardInfo]}>
              <Text style={styles.cardValue}>{summary?.collectionsThisMonth || 0}</Text>
              <Text style={styles.cardLabel}>Collections</Text>
            </View>
            <View style={[styles.card, styles.cardInfo]}>
              <Text style={styles.cardValue}>{summary?.paymentsThisMonth || 0}</Text>
              <Text style={styles.cardLabel}>Payments</Text>
            </View>
          </View>
        </View>

        {/* Top Supplier Balances */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Supplier Balances</Text>
          
          {topBalances.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No supplier data available</Text>
            </View>
          ) : (
            topBalances.map((balance) => (
              <View key={balance.supplier_id} style={styles.balanceCard}>
                <View style={styles.balanceHeader}>
                  <Text style={styles.balanceName}>{balance.supplier_name}</Text>
                  <Text style={styles.balanceCode}>{balance.supplier_code}</Text>
                </View>
                <View style={styles.balanceDetails}>
                  <Text style={styles.balanceDetailText}>
                    Collections: ${balance.total_collections.toFixed(2)}
                  </Text>
                  <Text style={styles.balanceDetailText}>
                    Payments: ${balance.total_payments.toFixed(2)}
                  </Text>
                </View>
                <Text style={[
                  styles.balanceAmount,
                  balance.balance > 0 ? styles.textRed : styles.textGreen
                ]}>
                  Balance: ${Math.abs(balance.balance).toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Last updated: {new Date().toLocaleString()}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007bff',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardBlue: {
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  cardGreen: {
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  cardOrange: {
    borderLeftWidth: 4,
    borderLeftColor: '#fd7e14',
  },
  cardPurple: {
    borderLeftWidth: 4,
    borderLeftColor: '#6f42c1',
  },
  cardInfo: {
    borderLeftWidth: 4,
    borderLeftColor: '#17a2b8',
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  financialCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  financialLabel: {
    fontSize: 14,
    color: '#666',
  },
  financialLabelBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  financialValue: {
    fontSize: 16,
    color: '#333',
  },
  financialValueBold: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  textGreen: {
    color: '#28a745',
  },
  textRed: {
    color: '#dc3545',
  },
  balanceCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  balanceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  balanceCode: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  balanceDetails: {
    marginBottom: 8,
  },
  balanceDetailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
