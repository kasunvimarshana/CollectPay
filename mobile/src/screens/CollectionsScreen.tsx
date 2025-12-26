import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Title, Paragraph, FAB, Chip, Text, Portal, Modal, TextInput, Button } from 'react-native-paper';
import { StorageService } from '../services/StorageService';
import { syncService } from '../services/SyncService';
import { Collection } from '../types';

export default function CollectionsScreen() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '' });

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    const data = await StorageService.getCollections();
    setCollections(data);
  };

  const handleCreate = async () => {
    if (!newCollection.name) {
      Alert.alert('Error', 'Please enter collection name');
      return;
    }

    try {
      await syncService.createCollection(newCollection);
      setModalVisible(false);
      setNewCollection({ name: '', description: '' });
      await loadCollections();
      Alert.alert('Success', 'Collection created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create collection');
    }
  };

  const renderItem = ({ item }: { item: Collection }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>{item.description || 'No description'}</Paragraph>
        <View style={styles.chipRow}>
          <Chip icon="tag" mode="outlined">{item.status}</Chip>
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
        data={collections}
        renderItem={renderItem}
        keyExtractor={(item) => item.uuid}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No collections yet. Create one to get started!</Text>
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
          <Title>New Collection</Title>
          <TextInput
            label="Name"
            value={newCollection.name}
            onChangeText={(text) => setNewCollection({ ...newCollection, name: text })}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Description"
            value={newCollection.description}
            onChangeText={(text) => setNewCollection({ ...newCollection, description: text })}
            mode="outlined"
            multiline
            numberOfLines={3}
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
