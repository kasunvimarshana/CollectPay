import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Title, Paragraph, FAB, Chip, Text, Portal, Modal, TextInput, Button } from 'react-native-paper';
import { StorageService } from '../services/StorageService';
import { syncService } from '../services/SyncService';
import { Payment, Collection } from '../types';

export default function PaymentsScreen() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPayment, setNewPayment] = useState({
    collection_id: 0,
    amount: '',
    payment_method: 'cash' as const,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const paymentsData = await StorageService.getPayments();
    const collectionsData = await StorageService.getCollections();
    setPayments(paymentsData);
    setCollections(collectionsData);
  };

  const handleCreate = async () => {
    if (!newPayment.collection_id || !newPayment.amount) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    try {
      await syncService.createPayment({
        ...newPayment,
        amount: parseFloat(newPayment.amount),
      });
      setModalVisible(false);
      setNewPayment({ collection_id: 0, amount: '', payment_method: 'cash', notes: '' });
      await loadData();
      Alert.alert('Success', 'Payment created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create payment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      case 'cancelled': return 'gray';
      default: return 'blue';
    }
  };

  const renderItem = ({ item }: { item: Payment }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.payment_reference}</Title>
        <Paragraph>Amount: {item.currency} {item.amount.toFixed(2)}</Paragraph>
        <Paragraph>Method: {item.payment_method}</Paragraph>
        {item.notes && <Paragraph>Notes: {item.notes}</Paragraph>}
        <View style={styles.chipRow}>
          <Chip 
            icon="tag" 
            mode="outlined" 
            textStyle={{ color: getStatusColor(item.status) }}
          >
            {item.status}
          </Chip>
          <Chip icon="counter">v{item.version}</Chip>
          {item.synced_at && <Chip icon="sync" textStyle={{ color: 'green' }}>Synced</Chip>}
          {!item.synced_at && <Chip icon="cloud-upload" textStyle={{ color: 'orange' }}>Pending</Chip>}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={payments}
        renderItem={renderItem}
        keyExtractor={(item) => item.uuid}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No payments yet. Create one to get started!</Text>
          </View>
        }
      />
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setModalVisible(true)}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>New Payment</Title>
          <TextInput
            label="Amount"
            value={newPayment.amount}
            onChangeText={(text) => setNewPayment({ ...newPayment, amount: text })}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Payment Method"
            value={newPayment.payment_method}
            mode="outlined"
            style={styles.input}
            editable={false}
          />
          <TextInput
            label="Notes"
            value={newPayment.notes}
            onChangeText={(text) => setNewPayment({ ...newPayment, notes: text })}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
          />
          <View style={styles.buttonRow}>
            <Button mode="outlined" onPress={() => setModalVisible(false)}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleCreate}>
              Create
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 10,
    elevation: 2,
  },
  chipRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 50,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  input: {
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
});
