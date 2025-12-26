// Network monitoring and connectivity
import NetInfo from '@react-native-community/netinfo';
import { EventEmitter } from 'events';

class NetworkMonitor extends EventEmitter {
  constructor() {
    super();
    this.isConnected = false;
    this.unsubscribe = null;
  }

  init() {
    this.unsubscribe = NetInfo.addEventListener(state => {
      const wasConnected = this.isConnected;
      this.isConnected = state.isConnected && state.isInternetReachable;

      if (!wasConnected && this.isConnected) {
        // Network regained
        this.emit('networkRegained');
      } else if (wasConnected && !this.isConnected) {
        // Network lost
        this.emit('networkLost');
      }

      this.emit('networkStateChanged', this.isConnected);
    });
  }

  async checkConnection() {
    const state = await NetInfo.fetch();
    this.isConnected = state.isConnected && state.isInternetReachable;
    return this.isConnected;
  }

  getConnectionStatus() {
    return this.isConnected;
  }

  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

export default new NetworkMonitor();
