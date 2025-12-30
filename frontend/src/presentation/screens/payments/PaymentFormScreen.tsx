import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PaymentFormScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Payment Form - To be implemented</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 16, color: '#666' },
});

export default PaymentFormScreen;
