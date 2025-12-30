/**
 * Main App Navigation
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SupplierListScreen } from '../screens/SupplierListScreen';
import { SupplierFormScreen } from '../screens/SupplierFormScreen';
import { SupplierDetailScreen } from '../screens/SupplierDetailScreen';
import { ProductListScreen } from '../screens/ProductListScreen';
import { ProductFormScreen } from '../screens/ProductFormScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { CollectionListScreen } from '../screens/CollectionListScreen';
import { CollectionFormScreen } from '../screens/CollectionFormScreen';
import { CollectionDetailScreen } from '../screens/CollectionDetailScreen';
import { PaymentListScreen } from '../screens/PaymentListScreen';
import { PaymentFormScreen } from '../screens/PaymentFormScreen';
import { PaymentDetailScreen } from '../screens/PaymentDetailScreen';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Stack = createStackNavigator();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            
            {/* Supplier Screens */}
            <Stack.Screen name="SupplierList" component={SupplierListScreen} />
            <Stack.Screen name="SupplierForm" component={SupplierFormScreen} />
            <Stack.Screen name="SupplierDetail" component={SupplierDetailScreen} />
            
            {/* Product Screens */}
            <Stack.Screen name="ProductList" component={ProductListScreen} />
            <Stack.Screen name="ProductForm" component={ProductFormScreen} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            
            {/* Collection Screens */}
            <Stack.Screen name="CollectionList" component={CollectionListScreen} />
            <Stack.Screen name="CollectionForm" component={CollectionFormScreen} />
            <Stack.Screen name="CollectionDetail" component={CollectionDetailScreen} />
            
            {/* Payment Screens */}
            <Stack.Screen name="PaymentList" component={PaymentListScreen} />
            <Stack.Screen name="PaymentForm" component={PaymentFormScreen} />
            <Stack.Screen name="PaymentDetail" component={PaymentDetailScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
