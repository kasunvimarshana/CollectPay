import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Show nothing while loading
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)/dashboard" />;
  }

  return <Redirect href="/(auth)/login" />;
}
