import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import * as Crypto from 'expo-crypto';

import { store, persistor } from './src/store';
import { useAppDispatch, useAppSelector } from './src/hooks/redux';
import { setDeviceId } from './src/store/slices/appSlice';
import { useNetworkMonitoring, useAutoSync } from './src/services/sync';

// Screens (will be created next)
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import SuppliersScreen from './src/screens/SuppliersScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import CollectionsScreen from './src/screens/CollectionsScreen';
import PaymentsScreen from './src/screens/PaymentsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Suppliers" component={SuppliersScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Collections" component={CollectionsScreen} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();

  useNetworkMonitoring();
  useAutoSync();

  useEffect(() => {
    const initializeDeviceId = async () => {
      const deviceId = Crypto.randomUUID();
      dispatch(setDeviceId(deviceId));
    };
    initializeDeviceId();
  }, [dispatch]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}

function AppContent() {
  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        }
        persistor={persistor}
      >
        <AppContent />
      </PersistGate>
    </Provider>
  );
}
