import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import SuppliersScreen from '../screens/SuppliersScreen';
import SupplierFormScreen from '../screens/SupplierFormScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ProductFormScreen from '../screens/ProductFormScreen';
import CollectionsScreen from '../screens/CollectionsScreen';
import CollectionFormScreen from '../screens/CollectionFormScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import PaymentFormScreen from '../screens/PaymentFormScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Paywise' }}
            />
            <Stack.Screen
              name="Suppliers"
              component={SuppliersScreen}
              options={{ title: 'Suppliers' }}
            />
            <Stack.Screen
              name="SupplierForm"
              component={SupplierFormScreen}
              options={({ route }) => ({
                title: route.params?.supplierId ? 'Edit Supplier' : 'Add Supplier'
              })}
            />
            <Stack.Screen
              name="Products"
              component={ProductsScreen}
              options={{ title: 'Products' }}
            />
            <Stack.Screen
              name="ProductForm"
              component={ProductFormScreen}
              options={({ route }) => ({
                title: route.params?.productId ? 'Edit Product' : 'Add Product'
              })}
            />
            <Stack.Screen
              name="Collections"
              component={CollectionsScreen}
              options={{ title: 'Collections' }}
            />
            <Stack.Screen
              name="CollectionForm"
              component={CollectionFormScreen}
              options={({ route }) => ({
                title: route.params?.collectionId ? 'Edit Collection' : 'Add Collection'
              })}
            />
            <Stack.Screen
              name="Payments"
              component={PaymentsScreen}
              options={{ title: 'Payments' }}
            />
            <Stack.Screen
              name="PaymentForm"
              component={PaymentFormScreen}
              options={({ route }) => ({
                title: route.params?.paymentId ? 'Edit Payment' : 'Add Payment'
              })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
