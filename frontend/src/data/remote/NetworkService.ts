import * as Network from 'expo-network';

export type NetworkStatus = 'online' | 'offline' | 'unknown';
export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor';

export class NetworkService {
  private static instance: NetworkService;
  private listeners: Set<(status: NetworkStatus) => void> = new Set();
  private currentStatus: NetworkStatus = 'unknown';
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  public async init(): Promise<void> {
    await this.checkConnection();
    this.startMonitoring();
  }

  private startMonitoring(): void {
    // Check connection every 5 seconds
    this.checkInterval = setInterval(async () => {
      await this.checkConnection();
    }, 5000);
  }

  public stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async checkConnection(): Promise<void> {
    try {
      const networkState = await Network.getNetworkStateAsync();
      const newStatus: NetworkStatus = networkState.isConnected && networkState.isInternetReachable
        ? 'online'
        : 'offline';

      if (newStatus !== this.currentStatus) {
        this.currentStatus = newStatus;
        this.notifyListeners(newStatus);
      }
    } catch (error) {
      console.error('Network check failed:', error);
      this.currentStatus = 'unknown';
    }
  }

  public async isOnline(): Promise<boolean> {
    await this.checkConnection();
    return this.currentStatus === 'online';
  }

  public getStatus(): NetworkStatus {
    return this.currentStatus;
  }

  public async getConnectionQuality(): Promise<ConnectionQuality> {
    try {
      const networkState = await Network.getNetworkStateAsync();
      
      if (!networkState.isConnected) {
        return 'poor';
      }

      // Simple heuristic based on connection type
      if (networkState.type === Network.NetworkStateType.WIFI) {
        return 'excellent';
      } else if (networkState.type === Network.NetworkStateType.CELLULAR) {
        return 'good';
      } else {
        return 'fair';
      }
    } catch (error) {
      return 'poor';
    }
  }

  public addListener(callback: (status: NetworkStatus) => void): void {
    this.listeners.add(callback);
  }

  public removeListener(callback: (status: NetworkStatus) => void): void {
    this.listeners.delete(callback);
  }

  private notifyListeners(status: NetworkStatus): void {
    this.listeners.forEach((callback) => {
      try {
        callback(status);
      } catch (error) {
        console.error('Network listener error:', error);
      }
    });
  }
}
