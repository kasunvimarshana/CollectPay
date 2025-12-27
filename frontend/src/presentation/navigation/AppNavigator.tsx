import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../../application/state/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import SuppliersScreen from '../screens/SuppliersScreen';
import SupplierDetailScreen from '../screens/SupplierDetailScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CollectionsScreen from '../screens/CollectionsScreen';
import CollectionDetailScreen from '../screens/CollectionDetailScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import PaymentDetailScreen from '../screens/PaymentDetailScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Suppliers: undefined;
  SupplierDetail: { id?: string };
  Products: undefined;
  ProductDetail: { id?: string };
  Collections: undefined;
  CollectionDetail: { id?: string };
  Payments: undefined;
  PaymentDetail: { id?: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading screen
  }

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
        {!user ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'TrackVault' }} />
            <Stack.Screen name="Suppliers" component={SuppliersScreen} />
            <Stack.Screen name="SupplierDetail" component={SupplierDetailScreen} options={{ title: 'Supplier' }} />
            <Stack.Screen name="Products" component={ProductsScreen} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product' }} />
            <Stack.Screen name="Collections" component={CollectionsScreen} />
            <Stack.Screen name="CollectionDetail" component={CollectionDetailScreen} options={{ title: 'Collection' }} />
            <Stack.Screen name="Payments" component={PaymentsScreen} />
            <Stack.Screen name="PaymentDetail" component={PaymentDetailScreen} options={{ title: 'Payment' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
