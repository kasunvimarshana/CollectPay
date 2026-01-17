/**
 * Printer Service Interface
 * Defines the contract for printer operations (domain layer)
 */

import { PrinterDevice, PrintJob, PrinterSettings, PrintableDocument } from '../entities/Printer';

export interface IPrinterService {
  /**
   * Initialize the printer service
   */
  initialize(): Promise<void>;

  /**
   * Scan for available Bluetooth printers
   */
  scanForDevices(): Promise<PrinterDevice[]>;

  /**
   * Connect to a printer device
   */
  connect(deviceId: string): Promise<boolean>;

  /**
   * Disconnect from current printer
   */
  disconnect(): Promise<void>;

  /**
   * Get current connection status
   */
  getConnectionStatus(): string;

  /**
   * Print a document
   */
  print(document: PrintableDocument): Promise<boolean>;

  /**
   * Queue a print job for later execution
   */
  queuePrintJob(document: PrintableDocument): Promise<string>;

  /**
   * Process pending print jobs
   */
  processPrintQueue(): Promise<void>;

  /**
   * Get all print jobs
   */
  getPrintJobs(): Promise<PrintJob[]>;

  /**
   * Get pending print jobs count
   */
  getPendingJobsCount(): Promise<number>;

  /**
   * Retry a failed print job
   */
  retryPrintJob(jobId: string): Promise<boolean>;

  /**
   * Cancel a print job
   */
  cancelPrintJob(jobId: string): Promise<void>;

  /**
   * Get printer settings
   */
  getSettings(): Promise<PrinterSettings>;

  /**
   * Update printer settings
   */
  updateSettings(settings: Partial<PrinterSettings>): Promise<void>;

  /**
   * Get connected printer device
   */
  getConnectedDevice(): Promise<PrinterDevice | null>;

  /**
   * Get saved devices
   */
  getSavedDevices(): Promise<PrinterDevice[]>;
}
