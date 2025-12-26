import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StorageService } from './src/services/StorageService';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CollectionsScreen from './src/screens/CollectionsScreen';
import PaymentsScreen from './src/screens/PaymentsScreen';
import RatesScreen from './src/screens/RatesScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await StorageService.getAuthToken();
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: true }}>
          {!isAuthenticated ? (
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ title: 'Login' }}
            />
          ) : (
            <>
              <Stack.Screen 
                name="Home" 
                component={HomeScreen}
                options={{ title: 'Collection & Payments' }}
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
              <Stack.Screen 
                name="Rates" 
                component={RatesScreen}
                options={{ title: 'Rates' }}
              />
            </>
          )}
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </PaperProvider>
  );
}
