/**
 * Printer Domain Entities
 * Defines the core printer domain models
 */

export enum PrinterConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  PRINTING = 'printing',
  ERROR = 'error',
}

export enum PrintJobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  QUEUED = 'queued',
}

export enum PrintJobType {
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  JOB_SUMMARY = 'job_summary',
  REPORT = 'report',
}

export interface PrinterDevice {
  id: string;
  name: string;
  address?: string;
  isConnected: boolean;
  lastConnected?: Date;
  manufacturer?: string;
  model?: string;
}

export interface PrintJob {
  id: string;
  type: PrintJobType;
  status: PrintJobStatus;
  data: any;
  createdAt: Date;
  printedAt?: Date;
  retryCount: number;
  error?: string;
  printerId?: string;
}

export interface PrintableDocument {
  type: PrintJobType;
  title: string;
  data: any;
}

export interface PrinterSettings {
  selectedPrinterId?: string;
  paperWidth: number; // in mm
  encoding: string;
  autoRetry: boolean;
  maxRetries: number;
  retryDelay: number; // in ms
  fallbackToPDF: boolean;
}
