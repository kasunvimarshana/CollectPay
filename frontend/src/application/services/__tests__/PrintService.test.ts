/**
 * PrintService Tests
 */

import PrintService from '../PrintService';
import { PrintJobType, PrinterConnectionStatus } from '../../../domain/entities/Printer';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('expo-print', () => ({
  printAsync: jest.fn(),
  printToFileAsync: jest.fn(() => Promise.resolve({ uri: 'file://test.pdf' })),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(),
}));

jest.mock('../../../infrastructure/printer/BluetoothPrinterAdapter', () => {
  return {
    BluetoothPrinterAdapter: jest.fn().mockImplementation(() => ({
      initialize: jest.fn(),
      scanForDevices: jest.fn(() => Promise.resolve([])),
      connect: jest.fn(() => Promise.resolve(false)),
      disconnect: jest.fn(() => Promise.resolve()),
      getConnectionStatus: jest.fn(() => 'disconnected'),
      sendData: jest.fn(() => Promise.resolve(false)),
      getConnectedDevice: jest.fn(() => null),
      isConnected: jest.fn(() => false),
    })),
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      initialize: jest.fn(),
      scanForDevices: jest.fn(() => Promise.resolve([])),
      connect: jest.fn(() => Promise.resolve(false)),
      disconnect: jest.fn(() => Promise.resolve()),
      getConnectionStatus: jest.fn(() => 'disconnected'),
      sendData: jest.fn(() => Promise.resolve(false)),
      getConnectedDevice: jest.fn(() => null),
      isConnected: jest.fn(() => false),
    })),
  };
});

describe('PrintService', () => {
  let printService: PrintService;

  beforeEach(() => {
    printService = PrintService.getInstance();
    jest.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PrintService.getInstance();
      const instance2 = PrintService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('Settings Management', () => {
    it('should return default settings initially', async () => {
      const settings = await printService.getSettings();
      
      expect(settings).toBeDefined();
      expect(settings.paperWidth).toBe(58);
      expect(settings.autoRetry).toBe(true);
      expect(settings.fallbackToPDF).toBe(true);
    });

    it('should update settings', async () => {
      await printService.updateSettings({ autoRetry: false });
      const settings = await printService.getSettings();
      
      expect(settings.autoRetry).toBe(false);
    });
  });

  describe('Print Queue', () => {
    it('should queue print jobs', async () => {
      const document = {
        type: PrintJobType.RECEIPT,
        title: 'Test Receipt',
        data: { total: 100 },
      };

      const jobId = await printService.queuePrintJob(document);
      
      expect(jobId).toBeDefined();
      expect(typeof jobId).toBe('string');
    });

    it('should get pending jobs count', async () => {
      const count = await printService.getPendingJobsCount();
      
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('should get all print jobs', async () => {
      const jobs = await printService.getPrintJobs();
      
      expect(Array.isArray(jobs)).toBe(true);
    });
  });

  describe('Connection Status', () => {
    it('should return connection status', () => {
      const status = printService.getConnectionStatus();
      
      expect(typeof status).toBe('string');
      expect(Object.values(PrinterConnectionStatus)).toContain(status);
    });
  });

  describe('Print Operations', () => {
    it('should handle print when not connected', async () => {
      const document = {
        type: PrintJobType.INVOICE,
        title: 'Test Invoice',
        data: {
          type: 'collection',
          collection: {
            id: 1,
            total_amount: 1000,
            quantity: 10,
            unit: 'kg',
            rate_applied: 100,
            collection_date: '2024-01-15',
          },
        },
      };

      const result = await printService.print(document);
      
      // Should return false and queue the job
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Job Management', () => {
    it('should cancel a print job', async () => {
      const document = {
        type: PrintJobType.RECEIPT,
        title: 'Test Receipt',
        data: { total: 100 },
      };

      const jobId = await printService.queuePrintJob(document);
      await printService.cancelPrintJob(jobId);
      
      const jobs = await printService.getPrintJobs();
      const job = jobs.find(j => j.id === jobId);
      
      expect(job).toBeUndefined();
    });

    it('should retry a print job', async () => {
      const document = {
        type: PrintJobType.RECEIPT,
        title: 'Test Receipt',
        data: { total: 100 },
      };

      const jobId = await printService.queuePrintJob(document);
      const result = await printService.retryPrintJob(jobId);
      
      expect(typeof result).toBe('boolean');
    });
  });
});
