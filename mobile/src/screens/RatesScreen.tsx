import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Paragraph, Chip, Text } from 'react-native-paper';
import { StorageService } from '../services/StorageService';
import { Rate } from '../types';

export default function RatesScreen() {
  const [rates, setRates] = useState<Rate[]>([]);

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    const data = await StorageService.getRates();
    setRates(data);
  };

  const renderItem = ({ item }: { item: Rate }) => {
    const isActive = item.is_active;
    const now = new Date();
    const effectiveFrom = new Date(item.effective_from);
    const effectiveUntil = item.effective_until ? new Date(item.effective_until) : null;
    const isCurrent = isActive && effectiveFrom <= now && (!effectiveUntil || effectiveUntil >= now);

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title>{item.name}</Title>
          <Paragraph>{item.description || 'No description'}</Paragraph>
          <Paragraph>Amount: {item.currency} {item.amount.toFixed(2)}</Paragraph>
          <Paragraph>Type: {item.rate_type}</Paragraph>
          <Paragraph>Effective From: {new Date(item.effective_from).toLocaleDateString()}</Paragraph>
          {item.effective_until && (
            <Paragraph>Effective Until: {new Date(item.effective_until).toLocaleDateString()}</Paragraph>
          )}
          <View style={styles.chipRow}>
            <Chip 
              icon={isCurrent ? "check-circle" : "circle-outline"} 
              mode="outlined"
              textStyle={{ color: isCurrent ? 'green' : 'gray' }}
            >
              {isCurrent ? 'Current' : isActive ? 'Active' : 'Inactive'}
            </Chip>
            <Chip icon="counter">v{item.version}</Chip>
            {item.synced_at && <Chip icon="sync" textStyle={{ color: 'green' }}>Synced</Chip>}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={rates}
        renderItem={renderItem}
        keyExtractor={(item) => item.uuid}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No rates available. Sync to get latest rates.</Text>
          </View>
        }
      />
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 50,
  },
});
