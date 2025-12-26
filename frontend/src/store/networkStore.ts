import { create } from 'zustand';
import * as Network from 'expo-network';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  initialize: () => () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isConnected: false,
  isInternetReachable: null,
  connectionType: null,

  initialize: () => {
    // Fetch initial network state
    Network.getNetworkStateAsync().then(state => {
      set({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type,
      });
    });

    // Poll network state periodically (since expo-network doesn't have event listeners)
    const interval = setInterval(async () => {
      const state = await Network.getNetworkStateAsync();
      set({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type,
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  },
}));
