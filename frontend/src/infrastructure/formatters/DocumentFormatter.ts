/**
 * Document Formatters
 * Formats business documents for thermal printing
 */

import { ESCPOSBuilder, TextAlignment } from '../../core/utils/ESCPOSBuilder';
import { Collection } from '../../domain/entities/Collection';
import { Payment } from '../../domain/entities/Payment';
import { PrintJobType } from '../../domain/entities/Printer';

export interface InvoiceData {
  collection?: Collection;
  payment?: Payment;
  type: 'collection' | 'payment';
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
}

export interface ReceiptData {
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

export interface JobSummaryData {
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

export class DocumentFormatter {
  /**
   * Format a collection invoice
   */
  static formatCollectionInvoice(data: InvoiceData): Uint8Array {
    const builder = new ESCPOSBuilder();
    
    // Header
    builder
      .title(data.companyName || 'CollectPay')
      .centerText(data.companyAddress || '')
      .centerText(data.companyPhone || '')
      .newLine()
      .divider();

    // Document type
    builder
      .subtitle('COLLECTION INVOICE')
      .newLine();

    if (data.collection) {
      const col = data.collection;
      
      // Invoice details
      builder
        .leftRight('Invoice #:', `COL-${col.id}`)
        .leftRight('Date:', new Date(col.collection_date).toLocaleDateString())
        .divider();

      // Supplier info
      builder
        .bold(true)
        .text('Supplier Information')
        .bold(false)
        .newLine()
        .leftRight('Name:', col.supplier?.name || 'N/A')
        .leftRight('Code:', col.supplier?.code || 'N/A')
        .divider();

      // Product info
      builder
        .bold(true)
        .text('Collection Details')
        .bold(false)
        .newLine()
        .leftRight('Product:', col.product?.name || 'N/A')
        .leftRight('Quantity:', `${col.quantity} ${col.unit}`)
        .leftRight('Rate:', col.rate_applied.toFixed(2))
        .divider();

      // Total
      builder
        .bold(true)
        .setTextSize(1)
        .leftRight('TOTAL:', col.total_amount.toFixed(2))
        .setTextSize(0)
        .bold(false)
        .divider();

      // Notes
      if (col.notes) {
        builder
          .text('Notes:')
          .newLine()
          .text(col.notes)
          .newLine()
          .divider();
      }
    }

    // Footer
    builder
      .newLine()
      .centerText('Thank you for your business!')
      .newLine()
      .centerText(new Date().toLocaleString())
      .newLine(2)
      .cut();

    return builder.build();
  }

  /**
   * Format a payment receipt
   */
  static formatPaymentReceipt(data: InvoiceData): Uint8Array {
    const builder = new ESCPOSBuilder();
    
    // Header
    builder
      .title(data.companyName || 'CollectPay')
      .centerText(data.companyAddress || '')
      .centerText(data.companyPhone || '')
      .newLine()
      .divider();

    // Document type
    builder
      .subtitle('PAYMENT RECEIPT')
      .newLine();

    if (data.payment) {
      const pay = data.payment;
      
      // Receipt details
      builder
        .leftRight('Receipt #:', `PAY-${pay.id}`)
        .leftRight('Date:', new Date(pay.payment_date).toLocaleDateString())
        .divider();

      // Supplier info
      builder
        .bold(true)
        .text('Supplier Information')
        .bold(false)
        .newLine()
        .leftRight('Name:', pay.supplier?.name || 'N/A')
        .divider();

      // Payment info
      builder
        .bold(true)
        .text('Payment Details')
        .bold(false)
        .newLine()
        .leftRight('Type:', pay.type.toUpperCase())
        .leftRight('Method:', pay.payment_method || 'Cash')
        .leftRight('Reference:', pay.reference_number || 'N/A')
        .divider();

      // Amount
      builder
        .bold(true)
        .setTextSize(1)
        .leftRight('AMOUNT:', pay.amount.toFixed(2))
        .setTextSize(0)
        .bold(false)
        .divider();

      // Notes
      if (pay.notes) {
        builder
          .text('Notes:')
          .newLine()
          .text(pay.notes)
          .newLine()
          .divider();
      }
    }

    // Footer
    builder
      .newLine()
      .centerText('Thank you for your payment!')
      .newLine()
      .centerText(new Date().toLocaleString())
      .newLine(2)
      .cut();

    return builder.build();
  }

  /**
   * Format a generic receipt
   */
  static formatReceipt(data: ReceiptData): Uint8Array {
    const builder = new ESCPOSBuilder();
    
    // Header
    builder
      .title('CollectPay')
      .subtitle('RECEIPT')
      .divider();

    // Receipt details
    builder
      .leftRight('Receipt #:', data.transactionId)
      .leftRight('Date:', data.date)
      .divider();

    // Items
    builder
      .bold(true)
      .text('Items')
      .bold(false)
      .newLine();

    data.items.forEach((item) => {
      builder.text(item.description).newLine();
      if (item.quantity && item.unit && item.rate) {
        builder
          .text(`  ${item.quantity} ${item.unit} x ${item.rate.toFixed(2)}`)
          .newLine();
      }
      builder
        .leftRight('', item.amount.toFixed(2))
        .newLine();
    });

    builder.divider();

    // Total
    builder
      .bold(true)
      .setTextSize(1)
      .leftRight('TOTAL:', data.total.toFixed(2))
      .setTextSize(0)
      .bold(false)
      .divider();

    // Payment method
    if (data.paymentMethod) {
      builder.leftRight('Payment:', data.paymentMethod).newLine();
    }

    // Notes
    if (data.notes) {
      builder
        .text('Notes:')
        .newLine()
        .text(data.notes)
        .newLine()
        .divider();
    }

    // Footer
    builder
      .newLine()
      .centerText('Thank you!')
      .newLine()
      .centerText(new Date().toLocaleString())
      .newLine(2)
      .cut();

    return builder.build();
  }

  /**
   * Format a job summary report
   */
  static formatJobSummary(data: JobSummaryData): Uint8Array {
    const builder = new ESCPOSBuilder();
    
    // Header
    builder
      .title('CollectPay')
      .subtitle(data.title)
      .leftRight('Date:', data.date)
      .divider();

    // Summary
    builder
      .bold(true)
      .text('Summary')
      .bold(false)
      .newLine();

    data.summary.forEach((item) => {
      builder.leftRight(item.label, String(item.value));
    });

    builder.divider();

    // Items (if any)
    if (data.items && data.items.length > 0) {
      builder
        .bold(true)
        .text('Details')
        .bold(false)
        .newLine();

      data.items.forEach((item) => {
        builder.leftRight(item.description, String(item.value));
      });

      builder.divider();
    }

    // Footer
    builder
      .newLine()
      .centerText('End of Report')
      .newLine()
      .centerText(new Date().toLocaleString())
      .newLine(2)
      .cut();

    return builder.build();
  }
}

export default DocumentFormatter;
