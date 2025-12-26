import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';

// Import screens (we'll create these next)
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import SuppliersListScreen from '../screens/Suppliers/SuppliersListScreen';
import SupplierDetailScreen from '../screens/Suppliers/SupplierDetailScreen';
import ProductsListScreen from '../screens/Products/ProductsListScreen';
import CollectionsListScreen from '../screens/Collections/CollectionsListScreen';
import CollectionFormScreen from '../screens/Collections/CollectionFormScreen';
import PaymentsListScreen from '../screens/Payments/PaymentsListScreen';
import PaymentFormScreen from '../screens/Payments/PaymentFormScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  SupplierDetail: { id: number };
  CollectionForm: { supplierId?: number };
  PaymentForm: { supplierId?: number };
};

export type MainTabParamList = {
  Home: undefined;
  Suppliers: undefined;
  Products: undefined;
  Collections: undefined;
  Payments: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { paddingBottom: 5, height: 60 },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Suppliers" 
        component={SuppliersListScreen}
        options={{ title: 'Suppliers' }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductsListScreen}
        options={{ title: 'Products' }}
      />
      <Tab.Screen 
        name="Collections" 
        component={CollectionsListScreen}
        options={{ title: 'Collections' }}
      />
      <Tab.Screen 
        name="Payments" 
        component={PaymentsListScreen}
        options={{ title: 'Payments' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ title: 'Login' }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ title: 'Register' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Main" 
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="SupplierDetail" 
              component={SupplierDetailScreen}
              options={{ title: 'Supplier Details' }}
            />
            <Stack.Screen 
              name="CollectionForm" 
              component={CollectionFormScreen}
              options={{ title: 'New Collection' }}
            />
            <Stack.Screen 
              name="PaymentForm" 
              component={PaymentFormScreen}
              options={{ title: 'New Payment' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
