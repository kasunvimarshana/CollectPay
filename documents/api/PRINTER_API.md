# Printer System API Documentation

## Overview

This document provides technical details about the printer system architecture, APIs, and integration points in the CollectPay application.

## Architecture

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────┐
│           Presentation Layer                    │
│  - PrinterSettingsScreen                        │
│  - PrinterStatusIndicator                       │
│  - Print buttons in detail screens              │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│           Application Layer                     │
│  - PrintService (orchestration)                 │
│  - Print queue management                       │
│  - Retry logic                                  │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│           Domain Layer                          │
│  - IPrinterService (interface)                  │
│  - Printer entities (types, enums)              │
└─────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│           Infrastructure Layer                  │
│  - BluetoothPrinterAdapter                      │
│  - DocumentFormatter                            │
│  - ESCPOSBuilder                                │
└─────────────────────────────────────────────────┘
```

## Domain Layer

### Entities

#### PrinterDevice
```typescript
interface PrinterDevice {
  id: string;                // Unique device identifier
  name: string;              // Human-readable name
  address?: string;          // MAC address (optional)
  isConnected: boolean;      // Connection status
  lastConnected?: Date;      // Last connection timestamp
  manufacturer?: string;     // Device manufacturer
  model?: string;            // Device model
}
```

#### PrintJob
```typescript
interface PrintJob {
  id: string;                    // Unique job identifier
  type: PrintJobType;            // Type of document
  status: PrintJobStatus;        // Current status
  data: any;                     // Document data
  createdAt: Date;               // Creation timestamp
  printedAt?: Date;              // Completion timestamp
  retryCount: number;            // Retry attempts
  error?: string;                // Error message if failed
  printerId?: string;            // Target printer ID
}
```

#### PrinterSettings
```typescript
interface PrinterSettings {
  selectedPrinterId?: string;    // Current printer ID
  paperWidth: number;            // Paper width in mm (58 or 80)
  encoding: string;              // Character encoding (UTF-8)
  autoRetry: boolean;            // Auto-retry failed jobs
  maxRetries: number;            // Max retry attempts (default: 3)
  retryDelay: number;            // Delay between retries in ms
  fallbackToPDF: boolean;        // Generate PDF on failure
}
```

### Enums

#### PrinterConnectionStatus
```typescript
enum PrinterConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  PRINTING = 'printing',
  ERROR = 'error',
}
```

#### PrintJobStatus
```typescript
enum PrintJobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  QUEUED = 'queued',
}
```

#### PrintJobType
```typescript
enum PrintJobType {
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  JOB_SUMMARY = 'job_summary',
  REPORT = 'report',
}
```

### Interface

#### IPrinterService
```typescript
interface IPrinterService {
  // Initialization
  initialize(): Promise<void>;
  
  // Device Management
  scanForDevices(): Promise<PrinterDevice[]>;
  connect(deviceId: string): Promise<boolean>;
  disconnect(): Promise<void>;
  getConnectionStatus(): string;
  getConnectedDevice(): Promise<PrinterDevice | null>;
  getSavedDevices(): Promise<PrinterDevice[]>;
  
  // Print Operations
  print(document: PrintableDocument): Promise<boolean>;
  queuePrintJob(document: PrintableDocument): Promise<string>;
  processPrintQueue(): Promise<void>;
  
  // Job Management
  getPrintJobs(): Promise<PrintJob[]>;
  getPendingJobsCount(): Promise<number>;
  retryPrintJob(jobId: string): Promise<boolean>;
  cancelPrintJob(jobId: string): Promise<void>;
  
  // Settings
  getSettings(): Promise<PrinterSettings>;
  updateSettings(settings: Partial<PrinterSettings>): Promise<void>;
}
```

## Application Layer

### PrintService

Main service class implementing IPrinterService with additional features:

```typescript
class PrintService implements IPrinterService {
  private static instance: PrintService;
  private bluetoothAdapter: BluetoothPrinterAdapter;
  private printQueue: PrintJob[];
  private settings: PrinterSettings;
  
  static getInstance(): PrintService;
  
  // All IPrinterService methods
  // Plus internal methods:
  
  private formatDocument(document: PrintableDocument): Uint8Array;
  private generatePDF(document: PrintableDocument): Promise<void>;
  private generateHTMLForPDF(document: PrintableDocument): string;
  private loadSettings(): Promise<void>;
  private loadPrintQueue(): Promise<void>;
  private savePrintQueue(): Promise<void>;
}
```

### Usage Examples

#### Initialize Service
```typescript
import PrintService from '@/application/services/PrintService';

// In App.tsx or main component
useEffect(() => {
  const initPrinter = async () => {
    const printService = PrintService.getInstance();
    await printService.initialize();
  };
  
  initPrinter();
}, []);
```

#### Scan and Connect
```typescript
// Scan for devices
const devices = await printService.scanForDevices();

// Connect to first device
if (devices.length > 0) {
  const success = await printService.connect(devices[0].id);
  console.log('Connected:', success);
}
```

#### Print a Document
```typescript
import { PrintJobType } from '@/domain/entities/Printer';

// Print collection invoice
const success = await printService.print({
  type: PrintJobType.INVOICE,
  title: 'Collection Invoice',
  data: {
    collection: collectionData,
    type: 'collection',
    companyName: 'CollectPay',
  },
});
```

#### Queue a Job
```typescript
// Queue job for later printing
const jobId = await printService.queuePrintJob({
  type: PrintJobType.RECEIPT,
  title: 'Payment Receipt',
  data: { payment: paymentData },
});

console.log('Job queued:', jobId);
```

#### Process Queue
```typescript
// Manually process pending jobs
await printService.processPrintQueue();
```

## Infrastructure Layer

### BluetoothPrinterAdapter

Low-level Bluetooth communication handler:

```typescript
class BluetoothPrinterAdapter {
  private bleManager: BleManager;
  private connectedDevice: Device | null;
  private connectionStatus: PrinterConnectionStatus;
  
  async initialize(): Promise<void>;
  async scanForDevices(durationMs: number): Promise<PrinterDevice[]>;
  async connect(deviceId: string): Promise<boolean>;
  async disconnect(): Promise<void>;
  async sendData(data: Uint8Array): Promise<boolean>;
  getConnectionStatus(): PrinterConnectionStatus;
  getConnectedDevice(): PrinterDevice | null;
  isConnected(): boolean;
}
```

### ESCPOSBuilder

Utility for building ESC/POS commands:

```typescript
class ESCPOSBuilder {
  // Initialization
  constructor();
  initialize(): ESCPOSBuilder;
  reset(): ESCPOSBuilder;
  
  // Text Operations
  text(text: string): ESCPOSBuilder;
  newLine(count?: number): ESCPOSBuilder;
  
  // Formatting
  align(alignment: TextAlignment): ESCPOSBuilder;
  setTextSize(size: TextSize): ESCPOSBuilder;
  bold(enabled?: boolean): ESCPOSBuilder;
  underline(enabled?: boolean): ESCPOSBuilder;
  
  // Layout
  horizontalLine(char?: string, width?: number): ESCPOSBuilder;
  divider(): ESCPOSBuilder;
  leftRight(left: string, right: string, width?: number): ESCPOSBuilder;
  centerText(text: string): ESCPOSBuilder;
  title(text: string): ESCPOSBuilder;
  subtitle(text: string): ESCPOSBuilder;
  
  // Advanced
  barcode(data: string, type?: BarcodeType): ESCPOSBuilder;
  qrCode(data: string, size?: number): ESCPOSBuilder;
  feed(lines?: number): ESCPOSBuilder;
  cut(partial?: boolean): ESCPOSBuilder;
  
  // Build
  build(): Uint8Array;
  buildBase64(): string;
}
```

#### Example Usage
```typescript
import { ESCPOSBuilder, TextAlignment } from '@/core/utils/ESCPOSBuilder';

const builder = new ESCPOSBuilder();
const commands = builder
  .title('CollectPay')
  .centerText('Thank you!')
  .divider()
  .leftRight('Total:', '100.00')
  .newLine(2)
  .cut()
  .build();
```

### DocumentFormatter

High-level document formatting:

```typescript
class DocumentFormatter {
  static formatCollectionInvoice(data: InvoiceData): Uint8Array;
  static formatPaymentReceipt(data: InvoiceData): Uint8Array;
  static formatReceipt(data: ReceiptData): Uint8Array;
  static formatJobSummary(data: JobSummaryData): Uint8Array;
}
```

#### Data Interfaces

```typescript
interface InvoiceData {
  collection?: Collection;
  payment?: Payment;
  type: 'collection' | 'payment';
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
}

interface ReceiptData {
  transactionId: string;
  date: string;
  items: Array<{
    description: string;
    quantity?: number;
    unit?: string;
    rate?: number;
    amount: number;
  }>;
  total: number;
  paymentMethod?: string;
  notes?: string;
}

interface JobSummaryData {
  title: string;
  date: string;
  summary: Array<{
    label: string;
    value: string | number;
  }>;
  items?: Array<{
    description: string;
    value: string | number;
  }>;
}
```

## Presentation Layer

### PrinterSettingsScreen

Main screen for printer management:

```typescript
const PrinterSettingsScreen: React.FC = () => {
  // State management
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [devices, setDevices] = useState<PrinterDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<PrinterDevice | null>(null);
  
  // Methods
  const handleScan = async () => { /* ... */ };
  const handleConnect = async (deviceId: string) => { /* ... */ };
  const handleDisconnect = async () => { /* ... */ };
  const handleProcessQueue = async () => { /* ... */ };
  
  // UI rendering
  return (/* ... */);
};
```

### PrinterStatusIndicator

Status indicator component:

```typescript
interface PrinterStatusIndicatorProps {
  onPress?: () => void;
}

const PrinterStatusIndicator: React.FC<PrinterStatusIndicatorProps> = ({ onPress }) => {
  const [status, setStatus] = useState<string>('disconnected');
  const [pendingJobs, setPendingJobs] = useState<number>(0);
  
  // Updates status every 3 seconds
  useEffect(() => {
    const interval = setInterval(updateStatus, 3000);
    return () => clearInterval(interval);
  }, []);
  
  return (/* Status badge UI */);
};
```

## Storage

### AsyncStorage Keys

```typescript
const STORAGE_KEYS = {
  PRINT_QUEUE: '@printQueue',
  PRINT_SETTINGS: '@printerSettings',
  SAVED_DEVICES: '@savedPrinterDevices',
  CONNECTED_DEVICE: '@connectedPrinterDevice',
};
```

### Data Persistence

Print queue and settings persist across app restarts:
- **Print Queue**: Stored as JSON array of PrintJob objects
- **Settings**: Stored as JSON object of PrinterSettings
- **Saved Devices**: Stored as JSON array of PrinterDevice objects

## Error Handling

### Error Types

```typescript
// Connection errors
'BLUETOOTH_DISABLED'
'PERMISSION_DENIED'
'DEVICE_NOT_FOUND'
'CONNECTION_FAILED'
'CONNECTION_TIMEOUT'

// Print errors
'PRINTER_NOT_CONNECTED'
'PRINTER_BUSY'
'PAPER_OUT'
'PRINT_FAILED'
'INVALID_COMMAND'

// Queue errors
'QUEUE_FULL'
'JOB_NOT_FOUND'
'MAX_RETRIES_EXCEEDED'
```

### Error Recovery

1. **Automatic Retry**: Failed jobs automatically retry up to `maxRetries` times
2. **Exponential Backoff**: Retry delay increases with each attempt
3. **PDF Fallback**: Generates PDF when printing fails and `fallbackToPDF` is true
4. **Queue Persistence**: Jobs persist across app restarts

## Performance Considerations

### Bluetooth Scanning
- Default scan duration: 10 seconds
- Can be adjusted in implementation
- Filter results by printer-specific keywords

### Queue Processing
- Processes jobs sequentially
- One job at a time to avoid overwhelming printer
- Stops on first failure or disconnection

### Memory Management
- Print queue stored in AsyncStorage (not RAM)
- Only active job held in memory during processing
- Completed jobs can be cleaned up periodically

## Security

### Bluetooth Security
- Uses standard Bluetooth pairing
- No custom encryption (relies on Bluetooth encryption)
- Printer must support secure pairing

### Data Privacy
- Print data not logged or transmitted externally
- Queue stored locally on device
- No cloud backup of print jobs

## Testing

### Unit Tests

```typescript
// ESCPOSBuilder - 19 tests
describe('ESCPOSBuilder', () => {
  test('should initialize correctly');
  test('should add text');
  test('should format text');
  // ... etc
});

// DocumentFormatter - 7 tests
describe('DocumentFormatter', () => {
  test('should format collection invoice');
  test('should format payment receipt');
  // ... etc
});

// PrintService - 10 tests
describe('PrintService', () => {
  test('should queue print jobs');
  test('should process queue');
  // ... etc
});
```

### Integration Testing

For integration tests on physical devices:

1. **Device Discovery**: Test scanning and device listing
2. **Connection**: Test connecting and disconnecting
3. **Print Operations**: Test actual printing
4. **Queue Management**: Test queue persistence
5. **Error Recovery**: Test retry logic

## Troubleshooting

### Debug Logging

Enable detailed logging:

```typescript
import Logger from '@/core/utils/Logger';

// All printer operations log via Logger
// Check console for [PrintService], [BluetoothPrinterAdapter] tags
```

### Common Issues

1. **"Printer not found"**: Check Bluetooth permissions
2. **"Connection failed"**: Restart printer and retry
3. **"Print quality poor"**: Clean print head, check paper
4. **"Queue stuck"**: Manual process via UI or clear queue

## Future Enhancements

Potential improvements:

- [ ] Multi-printer support (print to multiple printers)
- [ ] Custom receipt templates
- [ ] Print preview UI
- [ ] Wi-Fi printer support
- [ ] USB OTG printer support
- [ ] Batch printing
- [ ] Print statistics and analytics
- [ ] Custom paper sizes
- [ ] Logo/image printing
- [ ] Multiple language support for receipts

## Dependencies

### NPM Packages

```json
{
  "react-native-ble-plx": "^3.0.0",
  "expo-print": "~15.0.8",
  "expo-sharing": "~14.0.8",
  "expo-file-system": "~19.0.21",
  "@react-native-async-storage/async-storage": "2.2.0"
}
```

### Platform Requirements

**Android:**
- minSdkVersion: 23 (Android 6.0)
- Bluetooth permissions in AndroidManifest.xml

**iOS:**
- iOS 13.0+
- Bluetooth usage description in Info.plist

## Version History

- **v1.0.0** (January 2026)
  - Initial release
  - Basic Bluetooth printing
  - ESC/POS command support
  - Offline queue management
  - PDF fallback

---

**Maintainer:** CollectPay Development Team  
**Last Updated:** January 2026  
**License:** Proprietary
