/**
 * Payments List Screen
 * Displays list of payments
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePaymentStore } from '../state/usePaymentStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { NetworkStatus } from '../components/NetworkStatus';

interface PaymentsScreenProps {
  navigation: any;
}

export const PaymentsScreen: React.FC<PaymentsScreenProps> = ({ navigation }) => {
  const { payments, isLoading, error, fetchPayments } = usePaymentStore();

  useEffect(() => {
    fetchPayments();
  }, []);

  if (isLoading && payments.length === 0) {
    return <Loading message="Loading payments..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <NetworkStatus />
      
      <View style={styles.header}>
        <Text style={styles.title}>Payments</Text>
        <Button
          title="Add Payment"
          onPress={() => navigation.navigate('CreatePayment')}
          style={styles.addButton}
        />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={payments}
        keyExtractor={(item) => item.getId()}
        renderItem={({ item }) => (
          <Card style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <Text style={styles.paymentDate}>
                {item.getPaymentDate().toLocaleDateString()}
              </Text>
              <Text style={styles.amount}>
                {item.getAmount().getCurrency()} {item.getAmount().getAmount().toFixed(2)}
              </Text>
            </View>
            <View style={styles.typeContainer}>
              <Text style={[styles.typeBadge, styles[`type_${item.getType()}`]]}>
                {item.getType().toUpperCase()}
              </Text>
              {item.getReference() && (
                <Text style={styles.reference}>Ref: {item.getReference()}</Text>
              )}
            </View>
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
            <Text style={styles.emptyText}>No payments found</Text>
            <Text style={styles.emptySubtext}>Add your first payment to get started</Text>
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
  paymentCard: { marginBottom: 12 },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentDate: { fontSize: 16, fontWeight: '600', color: '#333' },
  amount: { fontSize: 16, fontWeight: '700', color: '#AF52DE' },
  typeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  typeBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  type_advance: { backgroundColor: '#E3F2FF', color: '#007AFF' },
  type_partial: { backgroundColor: '#FFF4E5', color: '#FF9500' },
  type_final: { backgroundColor: '#E8F5E9', color: '#4CAF50' },
  reference: { fontSize: 12, color: '#666' },
  notes: { fontSize: 14, color: '#999', fontStyle: 'italic', marginTop: 4 },
  errorContainer: { backgroundColor: '#FFE5E5', padding: 12, margin: 16, borderRadius: 8 },
  errorText: { color: '#D32F2F', fontSize: 14 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#666', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#999' },
});
