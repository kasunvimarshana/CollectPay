/**
 * DocumentFormatter Tests
 */

import { DocumentFormatter, InvoiceData, ReceiptData, JobSummaryData } from '../DocumentFormatter';
import { Collection } from '../../../domain/entities/Collection';
import { Payment } from '../../../domain/entities/Payment';

describe('DocumentFormatter', () => {
  describe('formatCollectionInvoice', () => {
    it('should format a collection invoice', () => {
      const collection: Partial<Collection> = {
        id: 1,
        collection_date: '2024-01-15',
        quantity: 50,
        unit: 'kg',
        rate_applied: 250,
        total_amount: 12500,
        supplier: {
          id: 1,
          name: 'Test Supplier',
          code: 'SUP001',
          contact_person: 'John Doe',
          phone: '1234567890',
          address: '123 Main St',
          is_active: true,
          version: 1,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        product: {
          id: 1,
          name: 'Tea Leaves',
          description: 'Premium tea',
          default_unit: 'kg',
          is_active: true,
          version: 1,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      };

      const invoiceData: InvoiceData = {
        collection: collection as Collection,
        type: 'collection',
        companyName: 'CollectPay',
        companyAddress: '123 Business St',
        companyPhone: '555-1234',
      };

      const result = DocumentFormatter.formatCollectionInvoice(invoiceData);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle missing optional data', () => {
      const collection: Partial<Collection> = {
        id: 1,
        collection_date: '2024-01-15',
        quantity: 50,
        unit: 'kg',
        rate_applied: 250,
        total_amount: 12500,
      };

      const invoiceData: InvoiceData = {
        collection: collection as Collection,
        type: 'collection',
      };

      const result = DocumentFormatter.formatCollectionInvoice(invoiceData);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatPaymentReceipt', () => {
    it('should format a payment receipt', () => {
      const payment: Partial<Payment> = {
        id: 1,
        payment_date: '2024-01-15',
        amount: 5000,
        type: 'partial',
        payment_method: 'Cash',
        reference_number: 'PAY-001',
        notes: 'Partial payment',
        supplier: {
          id: 1,
          name: 'Test Supplier',
          code: 'SUP001',
          contact_person: 'John Doe',
          phone: '1234567890',
          address: '123 Main St',
          is_active: true,
          version: 1,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      };

      const invoiceData: InvoiceData = {
        payment: payment as Payment,
        type: 'payment',
        companyName: 'CollectPay',
      };

      const result = DocumentFormatter.formatPaymentReceipt(invoiceData);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatReceipt', () => {
    it('should format a generic receipt', () => {
      const receiptData: ReceiptData = {
        transactionId: 'TXN-12345',
        date: '2024-01-15',
        items: [
          {
            description: 'Item 1',
            quantity: 2,
            unit: 'pcs',
            rate: 10,
            amount: 20,
          },
          {
            description: 'Item 2',
            quantity: 1,
            unit: 'pcs',
            rate: 30,
            amount: 30,
          },
        ],
        total: 50,
        paymentMethod: 'Cash',
        notes: 'Thank you for your purchase',
      };

      const result = DocumentFormatter.formatReceipt(receiptData);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle receipt without notes', () => {
      const receiptData: ReceiptData = {
        transactionId: 'TXN-12345',
        date: '2024-01-15',
        items: [
          {
            description: 'Item 1',
            amount: 50,
          },
        ],
        total: 50,
      };

      const result = DocumentFormatter.formatReceipt(receiptData);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatJobSummary', () => {
    it('should format a job summary report', () => {
      const summaryData: JobSummaryData = {
        title: 'Daily Summary',
        date: '2024-01-15',
        summary: [
          { label: 'Total Collections', value: 10 },
          { label: 'Total Amount', value: '25000.00' },
        ],
        items: [
          { description: 'Collection 1', value: '5000.00' },
          { description: 'Collection 2', value: '20000.00' },
        ],
      };

      const result = DocumentFormatter.formatJobSummary(summaryData);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle summary without items', () => {
      const summaryData: JobSummaryData = {
        title: 'Daily Summary',
        date: '2024-01-15',
        summary: [
          { label: 'Total Collections', value: 10 },
        ],
      };

      const result = DocumentFormatter.formatJobSummary(summaryData);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
