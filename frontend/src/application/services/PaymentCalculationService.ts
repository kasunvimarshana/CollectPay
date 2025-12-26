import { Collection, Payment } from '../../domain/entities';

export interface SupplierBalance {
  supplierId: string;
  supplierName?: string;
  totalCollectionValue: number;
  totalPayments: number;
  balanceDue: number;
  collectionCount: number;
  paymentCount: number;
}

export interface ProductSummary {
  productId: string;
  productName?: string;
  totalQuantity: number;
  totalValue: number;
  collectionCount: number;
}

export class PaymentCalculationService {
  /**
   * Calculate balance for a specific supplier
   */
  calculateSupplierBalance(
    collections: Collection[],
    payments: Payment[]
  ): SupplierBalance {
    if (collections.length === 0) {
      return {
        supplierId: '',
        totalCollectionValue: 0,
        totalPayments: 0,
        balanceDue: 0,
        collectionCount: 0,
        paymentCount: 0,
      };
    }

    const supplierId = collections[0].supplierId;

    // Calculate total collection value
    const totalCollectionValue = collections.reduce(
      (sum, collection) => sum + collection.quantity * collection.appliedRate,
      0
    );

    // Calculate total payments
    const totalPayments = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Calculate balance
    const balanceDue = totalCollectionValue - totalPayments;

    return {
      supplierId,
      totalCollectionValue: this.roundToTwo(totalCollectionValue),
      totalPayments: this.roundToTwo(totalPayments),
      balanceDue: this.roundToTwo(balanceDue),
      collectionCount: collections.length,
      paymentCount: payments.length,
    };
  }

  /**
   * Group collections by product and calculate totals
   */
  groupCollectionsByProduct(collections: Collection[]): ProductSummary[] {
    const productMap = new Map<string, ProductSummary>();

    for (const collection of collections) {
      const existing = productMap.get(collection.productId);
      const value = collection.quantity * collection.appliedRate;

      if (existing) {
        existing.totalQuantity += collection.quantity;
        existing.totalValue += value;
        existing.collectionCount += 1;
      } else {
        productMap.set(collection.productId, {
          productId: collection.productId,
          totalQuantity: collection.quantity,
          totalValue: value,
          collectionCount: 1,
        });
      }
    }

    return Array.from(productMap.values()).map(summary => ({
      ...summary,
      totalQuantity: this.roundToTwo(summary.totalQuantity),
      totalValue: this.roundToTwo(summary.totalValue),
    }));
  }

  /**
   * Calculate balances for multiple suppliers
   */
  calculateAllSupplierBalances(
    allCollections: Collection[],
    allPayments: Payment[]
  ): SupplierBalance[] {
    // Group by supplier
    const supplierCollections = new Map<string, Collection[]>();
    const supplierPayments = new Map<string, Payment[]>();

    for (const collection of allCollections) {
      const existing = supplierCollections.get(collection.supplierId) || [];
      existing.push(collection);
      supplierCollections.set(collection.supplierId, existing);
    }

    for (const payment of allPayments) {
      const existing = supplierPayments.get(payment.supplierId) || [];
      existing.push(payment);
      supplierPayments.set(payment.supplierId, existing);
    }

    // Calculate balance for each supplier
    const balances: SupplierBalance[] = [];
    const allSupplierIds = new Set([
      ...supplierCollections.keys(),
      ...supplierPayments.keys(),
    ]);

    for (const supplierId of allSupplierIds) {
      const collections = supplierCollections.get(supplierId) || [];
      const payments = supplierPayments.get(supplierId) || [];

      const balance = this.calculateSupplierBalance(collections, payments);
      balance.supplierId = supplierId;
      balances.push(balance);
    }

    return balances;
  }

  /**
   * Filter collections by date range
   */
  filterCollectionsByDateRange(
    collections: Collection[],
    fromDate?: Date,
    toDate?: Date
  ): Collection[] {
    return collections.filter(collection => {
      const collectionDate = new Date(collection.collectionDate);

      if (fromDate && collectionDate < fromDate) {
        return false;
      }

      if (toDate && collectionDate > toDate) {
        return false;
      }

      return true;
    });
  }

  /**
   * Filter payments by date range
   */
  filterPaymentsByDateRange(
    payments: Payment[],
    fromDate?: Date,
    toDate?: Date
  ): Payment[] {
    return payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);

      if (fromDate && paymentDate < fromDate) {
        return false;
      }

      if (toDate && paymentDate > toDate) {
        return false;
      }

      return true;
    });
  }

  /**
   * Round to 2 decimal places
   */
  private roundToTwo(num: number): number {
    return Math.round(num * 100) / 100;
  }
}
