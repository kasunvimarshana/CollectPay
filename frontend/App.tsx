/**
 * FieldPay Ledger - Main Application Entry Point
 * React Native (Expo) Frontend with Clean Architecture
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/presentation/navigation/AppNavigator';

export default function App() {
  return (
    <>
      <AppNavigator />
      <StatusBar style="light" />
    </>
  );
}
