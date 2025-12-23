import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { initDatabase } from './src/database/init';

import LoginScreen from './src/screens/Auth/LoginScreen';
import DashboardScreen from './src/screens/Dashboard/DashboardScreen';
import SupplierListScreen from './src/screens/Supplier/SupplierListScreen';
import SupplierDetailScreen from './src/screens/Supplier/SupplierDetailScreen';
import AddEditSupplierScreen from './src/screens/Supplier/AddEditSupplierScreen';
import CollectionListScreen from './src/screens/Collection/CollectionListScreen';
import CreateCollectionScreen from './src/screens/Collection/CreateCollectionScreen';
import PaymentListScreen from './src/screens/Payment/PaymentListScreen';
import CreatePaymentScreen from './src/screens/Payment/CreatePaymentScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

const SuppliersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SupplierList" component={SupplierListScreen} />
    <Stack.Screen name="SupplierDetail" component={SupplierDetailScreen} />
    <Stack.Screen name="AddEditSupplier" component={AddEditSupplierScreen} />
  </Stack.Navigator>
);

const CollectionsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CollectionList" component={CollectionListScreen} />
    <Stack.Screen name="CreateCollection" component={CreateCollectionScreen} />
  </Stack.Navigator>
);

const PaymentsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PaymentList" component={PaymentListScreen} />
    <Stack.Screen name="CreatePayment" component={CreatePaymentScreen} />
  </Stack.Navigator>
);

const MainTabs = () => {
  const { user } = useAuth();
  const canAccessPayments = user?.role === 'admin' || user?.role === 'manager';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { paddingBottom: 5, height: 60 },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardScreen}
        options={{ 
          tabBarLabel: 'Dashboard',
          title: 'Dashboard'
        }}
      />
      <Tab.Screen 
        name="SuppliersTab" 
        component={SuppliersStack}
        options={{ 
          tabBarLabel: 'Suppliers',
          title: 'Suppliers'
        }}
      />
      <Tab.Screen 
        name="CollectionsTab" 
        component={CollectionsStack}
        options={{ 
          tabBarLabel: 'Collections',
          title: 'Collections'
        }}
      />
      {canAccessPayments && (
        <Tab.Screen 
          name="PaymentsTab" 
          component={PaymentsStack}
          options={{ 
            tabBarLabel: 'Payments',
            title: 'Payments'
          }}
        />
      )}
    </Tab.Navigator>
  );
};

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Main" component={MainTabs} />
  </Stack.Navigator>
);

const Navigation = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(() => {
        console.log('Database initialized');
        setDbInitialized(true);
      })
      .catch(error => {
        console.error('Database initialization error:', error);
      });
  }, []);

  if (!dbInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <NetworkProvider>
        <Navigation />
        <StatusBar style="auto" />
      </NetworkProvider>
    </AuthProvider>
  );
}
