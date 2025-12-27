import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProductDetailScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Product Detail Screen - Coming Soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ProductDetailScreen;
