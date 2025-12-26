import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Import screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import SuppliersScreen from './screens/SuppliersScreen';
import ProductsScreen from './screens/ProductsScreen';
import CollectionsScreen from './screens/CollectionsScreen';
import PaymentsScreen from './screens/PaymentsScreen';

const Stack = createStackNavigator();

function Navigation() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isAuthenticated ? (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
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
              name="Products" 
              component={ProductsScreen}
              options={{ title: 'Products' }}
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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
