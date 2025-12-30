/**
 * Network Monitoring Service
 * Monitors network connectivity state
 * Following Clean Architecture - Infrastructure Layer
 */

import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';
import { NetworkState, ConnectionType } from '../../domain/valueObjects/NetworkState';

export type NetworkStateListener = (state: NetworkState) => void;

export class NetworkMonitoringService {
  private listeners: Set<NetworkStateListener> = new Set();
  private currentState: NetworkState = NetworkState.offline();
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    // Get initial state
    const netInfoState = await NetInfo.fetch();
    this.currentState = this.convertToNetworkState(netInfoState);

    // Subscribe to network state updates
    this.unsubscribe = NetInfo.addEventListener((state) => {
      const newState = this.convertToNetworkState(state);
      
      // Only notify if state changed
      if (!this.currentState.equals(newState)) {
        this.currentState = newState;
        this.notifyListeners(newState);
      }
    });
  }

  public getCurrentState(): NetworkState {
    return this.currentState;
  }

  public async checkConnectivity(): Promise<NetworkState> {
    const netInfoState = await NetInfo.fetch();
    this.currentState = this.convertToNetworkState(netInfoState);
    return this.currentState;
  }

  public addListener(listener: NetworkStateListener): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  public removeAllListeners(): void {
    this.listeners.clear();
  }

  public destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.removeAllListeners();
  }

  private convertToNetworkState(netInfoState: NetInfoState): NetworkState {
    const isConnected = netInfoState.isConnected ?? false;
    const isInternetReachable = netInfoState.isInternetReachable ?? false;
    const connectionType = this.mapConnectionType(netInfoState.type);

    return NetworkState.create(isConnected, connectionType, isInternetReachable);
  }

  private mapConnectionType(type: NetInfoStateType): ConnectionType {
    switch (type) {
      case 'wifi':
        return ConnectionType.WIFI;
      case 'cellular':
        return ConnectionType.CELLULAR;
      case 'none':
        return ConnectionType.NONE;
      default:
        return ConnectionType.UNKNOWN;
    }
  }

  private notifyListeners(state: NetworkState): void {
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error in network state listener:', errorMessage, error);
        // Continue notifying other listeners even if one fails
      }
    });
  }
}

// Singleton instance
export const networkMonitor = new NetworkMonitoringService();
