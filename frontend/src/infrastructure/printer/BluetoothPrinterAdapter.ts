/**
 * Bluetooth Printer Adapter
 * Infrastructure layer implementation for Bluetooth printer communication
 */

import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import { PrinterDevice, PrinterConnectionStatus } from '../../domain/entities/Printer';
import Logger from '../../core/utils/Logger';

export class BluetoothPrinterAdapter {
  private bleManager: BleManager;
  private connectedDevice: Device | null = null;
  private connectionStatus: PrinterConnectionStatus = PrinterConnectionStatus.DISCONNECTED;
  private scanSubscription: any = null;

  // Printer service UUIDs (common for thermal printers)
  private readonly PRINTER_SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb';
  private readonly PRINTER_CHAR_UUID = '00002af1-0000-1000-8000-00805f9b34fb';

  constructor() {
    this.bleManager = new BleManager();
  }

  /**
   * Initialize BLE manager and request permissions
   */
  async initialize(): Promise<void> {
    try {
      Logger.info('Initializing Bluetooth printer adapter', undefined, 'BluetoothPrinterAdapter');
      
      // Request permissions based on platform
      if (Platform.OS === 'android') {
        await this.requestAndroidPermissions();
      }

      // Check if Bluetooth is enabled
      const state = await this.bleManager.state();
      Logger.info(`Bluetooth state: ${state}`, undefined, 'BluetoothPrinterAdapter');

      if (state !== 'PoweredOn') {
        Logger.warn('Bluetooth is not powered on', undefined, 'BluetoothPrinterAdapter');
      }
    } catch (error) {
      Logger.error('Failed to initialize Bluetooth adapter', error, 'BluetoothPrinterAdapter');
      throw error;
    }
  }

  /**
   * Request Android Bluetooth permissions
   */
  private async requestAndroidPermissions(): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
      if (Platform.Version >= 31) {
        // Android 12+ requires new permissions
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        const allGranted = Object.values(granted).every(
          (status) => status === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          Logger.warn('Not all Bluetooth permissions granted', undefined, 'BluetoothPrinterAdapter');
        }
      } else {
        // Android 11 and below
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Logger.warn('Location permission not granted', undefined, 'BluetoothPrinterAdapter');
        }
      }
    } catch (error) {
      Logger.error('Failed to request permissions', error, 'BluetoothPrinterAdapter');
    }
  }

  /**
   * Scan for nearby Bluetooth printers
   */
  async scanForDevices(durationMs: number = 10000): Promise<PrinterDevice[]> {
    const devices: Map<string, PrinterDevice> = new Map();

    try {
      Logger.info('Starting Bluetooth scan', undefined, 'BluetoothPrinterAdapter');

      // Stop any existing scan
      if (this.scanSubscription) {
        this.scanSubscription.remove();
      }

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.bleManager.stopDeviceScan();
          Logger.info(`Scan completed. Found ${devices.size} devices`, undefined, 'BluetoothPrinterAdapter');
          resolve(Array.from(devices.values()));
        }, durationMs);

        this.scanSubscription = this.bleManager.startDeviceScan(
          null,
          { allowDuplicates: false },
          (error, device) => {
            if (error) {
              clearTimeout(timeout);
              Logger.error('Scan error', error, 'BluetoothPrinterAdapter');
              this.bleManager.stopDeviceScan();
              reject(error);
              return;
            }

            if (device && device.name) {
              // Filter for potential printers (you may need to adjust this logic)
              const isPrinter = this.isPotentialPrinter(device);
              
              if (isPrinter && !devices.has(device.id)) {
                const printerDevice: PrinterDevice = {
                  id: device.id,
                  name: device.name,
                  address: device.id,
                  isConnected: false,
                  manufacturer: device.manufacturerData ? 'Unknown' : undefined,
                };
                
                devices.set(device.id, printerDevice);
                Logger.info(`Found printer: ${device.name}`, undefined, 'BluetoothPrinterAdapter');
              }
            }
          }
        );
      });
    } catch (error) {
      Logger.error('Scan failed', error, 'BluetoothPrinterAdapter');
      throw error;
    }
  }

  /**
   * Check if device is potentially a printer
   */
  private isPotentialPrinter(device: Device): boolean {
    if (!device.name) return false;
    
    const name = device.name.toLowerCase();
    const printerKeywords = ['print', 'thermal', 'pos', 'receipt', 'escpos', 'bluetooth printer'];
    
    return printerKeywords.some(keyword => name.includes(keyword));
  }

  /**
   * Connect to a printer device
   */
  async connect(deviceId: string): Promise<boolean> {
    try {
      Logger.info(`Connecting to device: ${deviceId}`, undefined, 'BluetoothPrinterAdapter');
      this.connectionStatus = PrinterConnectionStatus.CONNECTING;

      // Disconnect existing connection if any
      if (this.connectedDevice) {
        await this.disconnect();
      }

      // Connect to device
      const device = await this.bleManager.connectToDevice(deviceId);
      
      // Discover services and characteristics
      await device.discoverAllServicesAndCharacteristics();
      
      this.connectedDevice = device;
      this.connectionStatus = PrinterConnectionStatus.CONNECTED;
      
      Logger.info(`Connected to device: ${device.name}`, undefined, 'BluetoothPrinterAdapter');
      return true;
    } catch (error) {
      Logger.error('Connection failed', error, 'BluetoothPrinterAdapter');
      this.connectionStatus = PrinterConnectionStatus.ERROR;
      this.connectedDevice = null;
      return false;
    }
  }

  /**
   * Disconnect from current printer
   */
  async disconnect(): Promise<void> {
    try {
      if (this.connectedDevice) {
        Logger.info('Disconnecting from printer', undefined, 'BluetoothPrinterAdapter');
        await this.bleManager.cancelDeviceConnection(this.connectedDevice.id);
        this.connectedDevice = null;
      }
      this.connectionStatus = PrinterConnectionStatus.DISCONNECTED;
    } catch (error) {
      Logger.error('Disconnect failed', error, 'BluetoothPrinterAdapter');
    }
  }

  /**
   * Send data to printer
   */
  async sendData(data: Uint8Array): Promise<boolean> {
    try {
      if (!this.connectedDevice) {
        throw new Error('No device connected');
      }

      this.connectionStatus = PrinterConnectionStatus.PRINTING;
      Logger.info('Sending data to printer', undefined, 'BluetoothPrinterAdapter');

      // Convert Uint8Array to base64
      const base64Data = this.uint8ArrayToBase64(data);

      // Try to find a writable characteristic
      const services = await this.connectedDevice.services();
      
      for (const service of services) {
        const characteristics = await service.characteristics();
        
        for (const char of characteristics) {
          // Check if characteristic is writable
          if (char.isWritableWithResponse || char.isWritableWithoutResponse) {
            try {
              await char.writeWithResponse(base64Data);
              Logger.info('Data sent successfully', undefined, 'BluetoothPrinterAdapter');
              this.connectionStatus = PrinterConnectionStatus.CONNECTED;
              return true;
            } catch (charError) {
              // Try next characteristic
              continue;
            }
          }
        }
      }

      throw new Error('No writable characteristic found');
    } catch (error) {
      Logger.error('Failed to send data', error, 'BluetoothPrinterAdapter');
      this.connectionStatus = PrinterConnectionStatus.ERROR;
      return false;
    }
  }

  /**
   * Convert Uint8Array to base64 string
   */
  private uint8ArrayToBase64(data: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < data.length; i++) {
      binary += String.fromCharCode(data[i]);
    }
    return btoa(binary);
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): PrinterConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Get connected device
   */
  getConnectedDevice(): PrinterDevice | null {
    if (!this.connectedDevice) return null;

    return {
      id: this.connectedDevice.id,
      name: this.connectedDevice.name || 'Unknown',
      address: this.connectedDevice.id,
      isConnected: true,
    };
  }

  /**
   * Check if device is connected
   */
  isConnected(): boolean {
    return this.connectedDevice !== null && 
           this.connectionStatus === PrinterConnectionStatus.CONNECTED;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.scanSubscription) {
      this.scanSubscription.remove();
    }
    this.bleManager.destroy();
  }
}

export default BluetoothPrinterAdapter;
