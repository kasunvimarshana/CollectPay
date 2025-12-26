import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Custom hook to monitor network connectivity status
 * Returns true if device is connected to the internet
 */
export function useNetworkStatus(): {
  isConnected: boolean;
  isChecking: boolean;
} {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
      setIsChecking(false);
    });

    // Initial check
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected ?? false);
      setIsChecking(false);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return { isConnected, isChecking };
}
