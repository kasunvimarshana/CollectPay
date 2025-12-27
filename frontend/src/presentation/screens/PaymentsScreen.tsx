import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PaymentsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Payments Screen - Coming Soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default PaymentsScreen;
