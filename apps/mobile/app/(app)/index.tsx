import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Home() {
  useEffect(() => {
    router.replace('/(app)/users');
  }, []);
  return null;
}
