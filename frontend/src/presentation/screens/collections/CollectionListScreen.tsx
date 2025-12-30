import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CollectionListScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Collection List - To be implemented</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 16, color: '#666' },
});

export default CollectionListScreen;
