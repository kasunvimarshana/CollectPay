import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export type NetworkStatus = {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
};

type NetworkChangeListener = (status: NetworkStatus) => void;

class NetworkService {
  private listeners: NetworkChangeListener[] = [];
  private currentStatus: NetworkStatus = {
    isConnected: false,
    isInternetReachable: null,
    type: null,
  };
  private unsubscribe: (() => void) | null = null;

  initialize(): void {
    // Subscribe to network state updates
    this.unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      this.currentStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      };

      // Notify all listeners
      this.notifyListeners();
    });

    // Fetch initial state
    NetInfo.fetch().then((state: NetInfoState) => {
      this.currentStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      };
      this.notifyListeners();
    });
  }

  getStatus(): NetworkStatus {
    return this.currentStatus;
  }

  isOnline(): boolean {
    // Conservative approach: Consider online only when explicitly connected
    // and internet is reachable. If isInternetReachable is null (unknown),
    // we treat it as potentially offline to avoid failed requests.
    // Applications can override this behavior by checking getStatus() directly.
    return this.currentStatus.isConnected && 
           (this.currentStatus.isInternetReachable === true);
  }

  addListener(listener: NetworkChangeListener): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentStatus);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });
  }

  async refresh(): Promise<NetworkStatus> {
    const state = await NetInfo.fetch();
    this.currentStatus = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
    };
    this.notifyListeners();
    return this.currentStatus;
  }

  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners = [];
  }
}

export default new NetworkService();
