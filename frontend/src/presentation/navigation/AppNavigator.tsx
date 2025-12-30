import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../../application/store/AuthContext';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import SupplierListScreen from '../screens/suppliers/SupplierListScreen';
import SupplierFormScreen from '../screens/suppliers/SupplierFormScreen';
import ProductListScreen from '../screens/products/ProductListScreen';
import ProductFormScreen from '../screens/products/ProductFormScreen';
import CollectionListScreen from '../screens/collections/CollectionListScreen';
import CollectionFormScreen from '../screens/collections/CollectionFormScreen';
import PaymentListScreen from '../screens/payments/PaymentListScreen';
import PaymentFormScreen from '../screens/payments/PaymentFormScreen';

const Stack = createStackNavigator();

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  SupplierList: undefined;
  SupplierForm: { id?: number };
  ProductList: undefined;
  ProductForm: { id?: number };
  CollectionList: undefined;
  CollectionForm: { id?: number };
  PaymentList: undefined;
  PaymentForm: { id?: number };
};

const AppNavigator: React.FC = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ title: 'Create Account' }}
            />
          </>
        ) : (
          // Main App Stack
          <>
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen}
              options={{ title: 'TrackVault' }}
            />
            <Stack.Screen 
              name="SupplierList" 
              component={SupplierListScreen}
              options={{ title: 'Suppliers' }}
            />
            <Stack.Screen 
              name="SupplierForm" 
              component={SupplierFormScreen}
              options={{ title: 'Supplier Details' }}
            />
            <Stack.Screen 
              name="ProductList" 
              component={ProductListScreen}
              options={{ title: 'Products' }}
            />
            <Stack.Screen 
              name="ProductForm" 
              component={ProductFormScreen}
              options={{ title: 'Product Details' }}
            />
            <Stack.Screen 
              name="CollectionList" 
              component={CollectionListScreen}
              options={{ title: 'Collections' }}
            />
            <Stack.Screen 
              name="CollectionForm" 
              component={CollectionFormScreen}
              options={{ title: 'Record Collection' }}
            />
            <Stack.Screen 
              name="PaymentList" 
              component={PaymentListScreen}
              options={{ title: 'Payments' }}
            />
            <Stack.Screen 
              name="PaymentForm" 
              component={PaymentFormScreen}
              options={{ title: 'Record Payment' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
