/**
 * App Navigation
 * Main navigation structure using React Navigation
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { SuppliersScreen } from '../screens/SuppliersScreen';
import { CreateSupplierScreen } from '../screens/CreateSupplierScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { CreateProductScreen } from '../screens/CreateProductScreen';
import { CollectionsScreen } from '../screens/CollectionsScreen';
import { PaymentsScreen } from '../screens/PaymentsScreen';

export type RootStackParamList = {
  Home: undefined;
  Suppliers: undefined;
  CreateSupplier: undefined;
  SupplierDetail: { id: string };
  Products: undefined;
  CreateProduct: undefined;
  ProductDetail: { id: string };
  Collections: undefined;
  CreateCollection: undefined;
  Payments: undefined;
  CreatePayment: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#FFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Suppliers" 
          component={SuppliersScreen}
          options={{ title: 'Suppliers' }}
        />
        <Stack.Screen 
          name="CreateSupplier" 
          component={CreateSupplierScreen}
          options={{ title: 'New Supplier' }}
        />
        <Stack.Screen 
          name="Products" 
          component={ProductsScreen}
          options={{ title: 'Products' }}
        />
        <Stack.Screen 
          name="CreateProduct" 
          component={CreateProductScreen}
          options={{ title: 'New Product' }}
        />
        <Stack.Screen 
          name="Collections" 
          component={CollectionsScreen}
          options={{ title: 'Collections' }}
        />
        <Stack.Screen 
          name="Payments" 
          component={PaymentsScreen}
          options={{ title: 'Payments' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
