/**
 * NetworkState Value Object
 * Represents the current network connectivity state
 * Following Clean Architecture - Domain Layer
 */

export enum ConnectionType {
  NONE = 'NONE',
  WIFI = 'WIFI',
  CELLULAR = 'CELLULAR',
  UNKNOWN = 'UNKNOWN',
}

export interface NetworkStateProps {
  isConnected: boolean;
  connectionType: ConnectionType;
  isInternetReachable: boolean;
  lastCheckedAt: Date;
}

export class NetworkState {
  private constructor(private props: NetworkStateProps) {}

  public static create(
    isConnected: boolean,
    connectionType: ConnectionType,
    isInternetReachable: boolean
  ): NetworkState {
    return new NetworkState({
      isConnected,
      connectionType,
      isInternetReachable,
      lastCheckedAt: new Date(),
    });
  }

  public static offline(): NetworkState {
    return new NetworkState({
      isConnected: false,
      connectionType: ConnectionType.NONE,
      isInternetReachable: false,
      lastCheckedAt: new Date(),
    });
  }

  public static online(connectionType: ConnectionType = ConnectionType.WIFI): NetworkState {
    return new NetworkState({
      isConnected: true,
      connectionType,
      isInternetReachable: true,
      lastCheckedAt: new Date(),
    });
  }

  public isConnected(): boolean {
    return this.props.isConnected;
  }

  public isOffline(): boolean {
    return !this.props.isConnected;
  }

  public getConnectionType(): ConnectionType {
    return this.props.connectionType;
  }

  public isInternetReachable(): boolean {
    return this.props.isInternetReachable;
  }

  public getLastCheckedAt(): Date {
    return this.props.lastCheckedAt;
  }

  public canSync(): boolean {
    return this.props.isConnected && this.props.isInternetReachable;
  }

  public equals(other: NetworkState): boolean {
    return (
      this.props.isConnected === other.props.isConnected &&
      this.props.connectionType === other.props.connectionType &&
      this.props.isInternetReachable === other.props.isInternetReachable
    );
  }

  public toJSON(): NetworkStateProps {
    return { ...this.props };
  }
}
