import io, { Socket } from "socket.io-client";
import * as SecureStore from "expo-secure-store";
import { SOCKET_CONFIG, STORAGE_KEYS } from "@/config/constants";

/**
 * Socket Service - Manages real-time WebSocket connections
 */
class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  async connect(): Promise<void> {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);

    if (!token) {
      throw new Error("No authentication token found");
    }

    this.socket = io(SOCKET_CONFIG.URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: SOCKET_CONFIG.RECONNECTION_ATTEMPTS,
      reconnectionDelay: SOCKET_CONFIG.RECONNECTION_DELAY,
    });

    this.setupDefaultListeners();
  }

  private setupDefaultListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket connected");
      this.notifyListeners("connect", null);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      this.notifyListeners("disconnect", reason);
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
      this.notifyListeners("error", error);
    });

    // Collection events
    this.socket.on("collection:new", (data) => {
      this.notifyListeners("collection:new", data);
    });

    this.socket.on("collection:update", (data) => {
      this.notifyListeners("collection:update", data);
    });

    this.socket.on("collection:approved", (data) => {
      this.notifyListeners("collection:approved", data);
    });

    this.socket.on("collection:rejected", (data) => {
      this.notifyListeners("collection:rejected", data);
    });

    // Payment events
    this.socket.on("payment:new", (data) => {
      this.notifyListeners("payment:new", data);
    });

    this.socket.on("payment:confirmed", (data) => {
      this.notifyListeners("payment:confirmed", data);
    });

    this.socket.on("payment:cancelled", (data) => {
      this.notifyListeners("payment:cancelled", data);
    });

    // Sync events
    this.socket.on("sync:response", (data) => {
      this.notifyListeners("sync:response", data);
    });

    this.socket.on("sync:status", (data) => {
      this.notifyListeners("sync:status", data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Emit events
  emit(event: string, data: any): void {
    if (!this.socket) {
      console.warn("Socket not connected");
      return;
    }

    this.socket.emit(event, data);
  }

  emitCollectionCreated(data: any): void {
    this.emit("collection:created", data);
  }

  emitCollectionUpdated(data: any): void {
    this.emit("collection:updated", data);
  }

  emitPaymentCreated(data: any): void {
    this.emit("payment:created", data);
  }

  emitSyncRequest(data: any): void {
    this.emit("sync:request", data);
  }

  emitSyncCompleted(data: any): void {
    this.emit("sync:completed", data);
  }

  // Event listener management
  addEventListener(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);
  }

  removeEventListener(event: string, callback: Function): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private notifyListeners(event: string, data: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  }
}

export const socketService = new SocketService();
