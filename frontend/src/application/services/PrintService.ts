/**
 * Print Service
 * Application layer service for managing print operations with queue and PDF fallback
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { 
  PrinterDevice, 
  PrintJob, 
  PrintJobStatus, 
  PrintJobType,
  PrintableDocument, 
  PrinterSettings,
  PrinterConnectionStatus 
} from '../../domain/entities/Printer';
import { IPrinterService } from '../../domain/interfaces/IPrinterService';
import BluetoothPrinterAdapter from '../../infrastructure/printer/BluetoothPrinterAdapter';
import DocumentFormatter, { InvoiceData, ReceiptData, JobSummaryData } from '../../infrastructure/formatters/DocumentFormatter';
import Logger from '../../core/utils/Logger';

const STORAGE_KEYS = {
  PRINT_QUEUE: '@printQueue',
  PRINT_SETTINGS: '@printerSettings',
  SAVED_DEVICES: '@savedPrinterDevices',
  CONNECTED_DEVICE: '@connectedPrinterDevice',
};

const DEFAULT_SETTINGS: PrinterSettings = {
  paperWidth: 58, // mm
  encoding: 'UTF-8',
  autoRetry: true,
  maxRetries: 3,
  retryDelay: 2000, // ms
  fallbackToPDF: true,
};

export class PrintService implements IPrinterService {
  private static instance: PrintService;
  private bluetoothAdapter: BluetoothPrinterAdapter;
  private printQueue: PrintJob[] = [];
  private settings: PrinterSettings = DEFAULT_SETTINGS;
  private isProcessingQueue = false;

  private constructor() {
    this.bluetoothAdapter = new BluetoothPrinterAdapter();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): PrintService {
    if (!PrintService.instance) {
      PrintService.instance = new PrintService();
    }
    return PrintService.instance;
  }

  /**
   * Initialize the print service
   */
  async initialize(): Promise<void> {
    try {
      Logger.info('Initializing Print Service', undefined, 'PrintService');
      
      // Initialize Bluetooth adapter
      await this.bluetoothAdapter.initialize();
      
      // Load settings
      await this.loadSettings();
      
      // Load print queue
      await this.loadPrintQueue();
      
      // Load saved devices
      const savedDevices = await this.getSavedDevices();
      Logger.info(`Loaded ${savedDevices.length} saved devices`, undefined, 'PrintService');
      
      Logger.info('Print Service initialized successfully', undefined, 'PrintService');
    } catch (error) {
      Logger.error('Failed to initialize Print Service', error, 'PrintService');
      throw error;
    }
  }

  /**
   * Scan for available Bluetooth printers
   */
  async scanForDevices(): Promise<PrinterDevice[]> {
    try {
      Logger.info('Scanning for printer devices', undefined, 'PrintService');
      const devices = await this.bluetoothAdapter.scanForDevices(10000);
      
      // Merge with saved devices
      const savedDevices = await this.getSavedDevices();
      const mergedDevices = this.mergeDevices(devices, savedDevices);
      
      return mergedDevices;
    } catch (error) {
      Logger.error('Device scan failed', error, 'PrintService');
      throw error;
    }
  }

  /**
   * Connect to a printer device
   */
  async connect(deviceId: string): Promise<boolean> {
    try {
      Logger.info(`Connecting to printer: ${deviceId}`, undefined, 'PrintService');
      
      const success = await this.bluetoothAdapter.connect(deviceId);
      
      if (success) {
        // Save connected device
        const device = this.bluetoothAdapter.getConnectedDevice();
        if (device) {
          await this.saveConnectedDevice(device);
          await this.addToSavedDevices(device);
        }
        
        // Process pending queue
        await this.processPrintQueue();
      }
      
      return success;
    } catch (error) {
      Logger.error('Connection failed', error, 'PrintService');
      return false;
    }
  }

  /**
   * Disconnect from current printer
   */
  async disconnect(): Promise<void> {
    try {
      await this.bluetoothAdapter.disconnect();
      await AsyncStorage.removeItem(STORAGE_KEYS.CONNECTED_DEVICE);
    } catch (error) {
      Logger.error('Disconnect failed', error, 'PrintService');
    }
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): string {
    return this.bluetoothAdapter.getConnectionStatus();
  }

  /**
   * Print a document
   */
  async print(document: PrintableDocument): Promise<boolean> {
    try {
      Logger.info(`Printing document: ${document.type}`, undefined, 'PrintService');
      
      // Check if printer is connected
      if (!this.bluetoothAdapter.isConnected()) {
        Logger.warn('Printer not connected, queueing job', undefined, 'PrintService');
        await this.queuePrintJob(document);
        
        // Fallback to PDF if enabled
        if (this.settings.fallbackToPDF) {
          await this.generatePDF(document);
        }
        
        return false;
      }

      // Format document
      const data = this.formatDocument(document);
      
      // Send to printer
      const success = await this.bluetoothAdapter.sendData(data);
      
      if (!success) {
        // Queue for retry
        await this.queuePrintJob(document);
        
        // Fallback to PDF
        if (this.settings.fallbackToPDF) {
          await this.generatePDF(document);
        }
      }
      
      return success;
    } catch (error) {
      Logger.error('Print failed', error, 'PrintService');
      
      // Queue for retry
      await this.queuePrintJob(document);
      
      // Fallback to PDF
      if (this.settings.fallbackToPDF) {
        await this.generatePDF(document);
      }
      
      return false;
    }
  }

  /**
   * Queue a print job
   */
  async queuePrintJob(document: PrintableDocument): Promise<string> {
    const job: PrintJob = {
      id: this.generateJobId(),
      type: document.type,
      status: PrintJobStatus.QUEUED,
      data: document.data,
      createdAt: new Date(),
      retryCount: 0,
    };

    this.printQueue.push(job);
    await this.savePrintQueue();
    
    Logger.info(`Print job queued: ${job.id}`, undefined, 'PrintService');
    return job.id;
  }

  /**
   * Process pending print jobs
   */
  async processPrintQueue(): Promise<void> {
    if (this.isProcessingQueue || this.printQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    Logger.info(`Processing ${this.printQueue.length} queued jobs`, undefined, 'PrintService');

    try {
      const pendingJobs = this.printQueue.filter(
        job => job.status === PrintJobStatus.QUEUED || job.status === PrintJobStatus.FAILED
      );

      for (const job of pendingJobs) {
        if (!this.bluetoothAdapter.isConnected()) {
          Logger.warn('Printer disconnected during queue processing', undefined, 'PrintService');
          break;
        }

        try {
          job.status = PrintJobStatus.PROCESSING;
          await this.savePrintQueue();

          const document: PrintableDocument = {
            type: job.type,
            title: job.type,
            data: job.data,
          };

          const data = this.formatDocument(document);
          const success = await this.bluetoothAdapter.sendData(data);

          if (success) {
            job.status = PrintJobStatus.COMPLETED;
            job.printedAt = new Date();
            Logger.info(`Print job completed: ${job.id}`, undefined, 'PrintService');
          } else {
            throw new Error('Print failed');
          }
        } catch (error) {
          job.retryCount++;
          
          if (job.retryCount >= this.settings.maxRetries) {
            job.status = PrintJobStatus.FAILED;
            job.error = error instanceof Error ? error.message : 'Unknown error';
            Logger.error(`Print job failed after ${job.retryCount} attempts: ${job.id}`, error, 'PrintService');
          } else {
            job.status = PrintJobStatus.QUEUED;
            Logger.warn(`Print job retry ${job.retryCount}/${this.settings.maxRetries}: ${job.id}`, undefined, 'PrintService');
            
            // Wait before next retry
            await new Promise(resolve => setTimeout(resolve, this.settings.retryDelay));
          }
        }

        await this.savePrintQueue();
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Get all print jobs
   */
  async getPrintJobs(): Promise<PrintJob[]> {
    return [...this.printQueue];
  }

  /**
   * Get pending print jobs count
   */
  async getPendingJobsCount(): Promise<number> {
    return this.printQueue.filter(
      job => job.status === PrintJobStatus.QUEUED || job.status === PrintJobStatus.PROCESSING
    ).length;
  }

  /**
   * Retry a failed print job
   */
  async retryPrintJob(jobId: string): Promise<boolean> {
    const job = this.printQueue.find(j => j.id === jobId);
    
    if (!job) {
      Logger.warn(`Print job not found: ${jobId}`, undefined, 'PrintService');
      return false;
    }

    job.status = PrintJobStatus.QUEUED;
    job.retryCount = 0;
    job.error = undefined;
    await this.savePrintQueue();

    await this.processPrintQueue();
    return true;
  }

  /**
   * Cancel a print job
   */
  async cancelPrintJob(jobId: string): Promise<void> {
    const index = this.printQueue.findIndex(j => j.id === jobId);
    
    if (index !== -1) {
      this.printQueue.splice(index, 1);
      await this.savePrintQueue();
      Logger.info(`Print job cancelled: ${jobId}`, undefined, 'PrintService');
    }
  }

  /**
   * Get printer settings
   */
  async getSettings(): Promise<PrinterSettings> {
    return { ...this.settings };
  }

  /**
   * Update printer settings
   */
  async updateSettings(newSettings: Partial<PrinterSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await AsyncStorage.setItem(STORAGE_KEYS.PRINT_SETTINGS, JSON.stringify(this.settings));
    Logger.info('Printer settings updated', undefined, 'PrintService');
  }

  /**
   * Get connected printer device
   */
  async getConnectedDevice(): Promise<PrinterDevice | null> {
    return this.bluetoothAdapter.getConnectedDevice();
  }

  /**
   * Get saved devices
   */
  async getSavedDevices(): Promise<PrinterDevice[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_DEVICES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      Logger.error('Failed to load saved devices', error, 'PrintService');
      return [];
    }
  }

  /**
   * Format document for printing
   */
  private formatDocument(document: PrintableDocument): Uint8Array {
    switch (document.type) {
      case PrintJobType.INVOICE:
        if (document.data.type === 'collection') {
          return DocumentFormatter.formatCollectionInvoice(document.data as InvoiceData);
        } else {
          return DocumentFormatter.formatPaymentReceipt(document.data as InvoiceData);
        }
      
      case PrintJobType.RECEIPT:
        return DocumentFormatter.formatReceipt(document.data as ReceiptData);
      
      case PrintJobType.JOB_SUMMARY:
      case PrintJobType.REPORT:
        return DocumentFormatter.formatJobSummary(document.data as JobSummaryData);
      
      default:
        throw new Error(`Unsupported document type: ${document.type}`);
    }
  }

  /**
   * Generate PDF as fallback
   */
  private async generatePDF(document: PrintableDocument): Promise<void> {
    try {
      Logger.info('Generating PDF fallback', undefined, 'PrintService');
      
      // Generate HTML content (reuse existing logic)
      const html = this.generateHTMLForPDF(document);
      
      const { uri } = await Print.printToFileAsync({ html });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Save ${document.title}`,
          UTI: 'com.adobe.pdf',
        });
      }
      
      Logger.info('PDF generated successfully', undefined, 'PrintService');
    } catch (error) {
      Logger.error('PDF generation failed', error, 'PrintService');
    }
  }

  /**
   * Generate HTML for PDF
   */
  private generateHTMLForPDF(document: PrintableDocument): string {
    // Basic HTML template - can be enhanced based on document type
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${document.title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          .content { margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>${document.title}</h1>
        <div class="content">
          <pre>${JSON.stringify(document.data, null, 2)}</pre>
        </div>
        <p style="text-align: center; margin-top: 40px;">
          Generated: ${new Date().toLocaleString()}
        </p>
      </body>
      </html>
    `;
  }

  /**
   * Helper methods
   */
  
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private async loadSettings(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PRINT_SETTINGS);
      if (data) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (error) {
      Logger.error('Failed to load settings', error, 'PrintService');
    }
  }

  private async loadPrintQueue(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PRINT_QUEUE);
      if (data) {
        this.printQueue = JSON.parse(data, (key, value) => {
          if (key === 'createdAt' || key === 'printedAt') {
            return value ? new Date(value) : undefined;
          }
          return value;
        });
      }
    } catch (error) {
      Logger.error('Failed to load print queue', error, 'PrintService');
    }
  }

  private async savePrintQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PRINT_QUEUE, JSON.stringify(this.printQueue));
    } catch (error) {
      Logger.error('Failed to save print queue', error, 'PrintService');
    }
  }

  private async saveConnectedDevice(device: PrinterDevice): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CONNECTED_DEVICE, JSON.stringify(device));
    } catch (error) {
      Logger.error('Failed to save connected device', error, 'PrintService');
    }
  }

  private async addToSavedDevices(device: PrinterDevice): Promise<void> {
    try {
      const savedDevices = await this.getSavedDevices();
      const exists = savedDevices.find(d => d.id === device.id);
      
      if (!exists) {
        savedDevices.push({
          ...device,
          lastConnected: new Date(),
        });
        await AsyncStorage.setItem(STORAGE_KEYS.SAVED_DEVICES, JSON.stringify(savedDevices));
      }
    } catch (error) {
      Logger.error('Failed to add device to saved list', error, 'PrintService');
    }
  }

  private mergeDevices(scannedDevices: PrinterDevice[], savedDevices: PrinterDevice[]): PrinterDevice[] {
    const merged = new Map<string, PrinterDevice>();
    
    // Add scanned devices
    scannedDevices.forEach(device => merged.set(device.id, device));
    
    // Add saved devices that weren't scanned
    savedDevices.forEach(device => {
      if (!merged.has(device.id)) {
        merged.set(device.id, { ...device, isConnected: false });
      }
    });
    
    return Array.from(merged.values());
  }
}

export default PrintService;
