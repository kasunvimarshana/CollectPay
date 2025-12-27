import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/application/state/AuthContext';
import { AppNavigator } from './src/presentation/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" />
      <AppNavigator />
    </AuthProvider>
  );
}
