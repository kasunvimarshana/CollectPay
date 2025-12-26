import { v4 as uuidv4 } from "uuid";
import {
  Collection,
  CollectionStatus,
  Payment,
  PaymentStatus,
  PaymentType,
  Product,
  ProductRate,
  Supplier,
  SyncStatus,
} from "../entities";

/**
 * Collection Service - Handles collection business logic
 */
export class CollectionService {
  /**
   * Creates a new collection with calculated amounts
   */
  static createCollection(params: CreateCollectionParams): Collection {
    const quantityInBaseUnit = this.convertToBaseUnit(
      params.quantity,
      params.unit,
      params.product.unitConversions
    );

    const grossAmount = quantityInBaseUnit * params.rate;
    const deductions = params.deductions ?? 0;
    const netAmount = grossAmount - deductions;

    return {
      id: uuidv4(),
      supplierId: params.supplierId,
      productId: params.product.id,
      collectorId: params.collectorId,
      collectedAt: params.collectedAt ?? new Date(),
      quantity: params.quantity,
      unit: params.unit,
      quantityInBaseUnit,
      rateAtCollection: params.rate,
      grossAmount,
      deductions,
      netAmount,
      status: "pending" as CollectionStatus,
      notes: params.notes,
      syncStatus: "pending" as SyncStatus,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      clientId: uuidv4(),
    };
  }

  /**
   * Converts quantity to base unit
   */
  static convertToBaseUnit(
    quantity: number,
    unit: string,
    conversions: Record<string, number>
  ): number {
    if (unit in conversions) {
      return quantity * conversions[unit];
    }
    // If no conversion found, assume it's already in base unit
    return quantity;
  }

  /**
   * Gets the applicable rate for a product at a given date
   */
  static getApplicableRate(
    rates: ProductRate[],
    date: Date
  ): ProductRate | null {
    return (
      rates.find((rate) => {
        const effectiveFrom = new Date(rate.effectiveFrom);
        const effectiveTo = rate.effectiveTo
          ? new Date(rate.effectiveTo)
          : null;

        return date >= effectiveFrom && (!effectiveTo || date <= effectiveTo);
      }) || null
    );
  }

  /**
   * Validates collection data
   */
  static validate(collection: Partial<Collection>): ValidationResult {
    const errors: string[] = [];

    if (!collection.supplierId) {
      errors.push("Supplier is required");
    }
    if (!collection.productId) {
      errors.push("Product is required");
    }
    if (!collection.quantity || collection.quantity <= 0) {
      errors.push("Quantity must be greater than 0");
    }
    if (!collection.rateAtCollection || collection.rateAtCollection <= 0) {
      errors.push("Rate must be greater than 0");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export interface CreateCollectionParams {
  supplierId: string;
  product: Product;
  collectorId: string;
  quantity: number;
  unit: string;
  rate: number;
  deductions?: number;
  notes?: string;
  collectedAt?: Date;
}

/**
 * Payment Service - Handles payment calculations and creation
 */
export class PaymentService {
  /**
   * Creates a new payment
   */
  static createPayment(params: CreatePaymentParams): Payment {
    return {
      id: uuidv4(),
      supplierId: params.supplierId,
      paymentType: params.paymentType,
      paymentMethod: params.paymentMethod,
      amount: params.amount,
      settlementPeriodStart: params.settlementPeriodStart,
      settlementPeriodEnd: params.settlementPeriodEnd,
      totalCollectionAmount: params.totalCollectionAmount,
      totalDeductions: params.totalDeductions,
      previousBalance: params.previousBalance,
      advances: params.advances,
      calculatedAmount: params.calculatedAmount,
      referenceNumber: this.generateReferenceNumber(),
      status: "pending" as PaymentStatus,
      notes: params.notes,
      syncStatus: "pending" as SyncStatus,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      clientId: uuidv4(),
    };
  }

  /**
   * Calculates settlement amount
   */
  static calculateSettlement(params: SettlementParams): SettlementResult {
    const totalCollections = params.collections.reduce(
      (sum, c) => sum + c.netAmount,
      0
    );
    const totalDeductions = params.deductions ?? 0;
    const previousBalance = params.previousBalance ?? 0;
    const advancesPaid = params.advancesPaid ?? 0;

    const netPayable =
      totalCollections - totalDeductions + previousBalance - advancesPaid;

    return {
      totalCollections,
      totalDeductions,
      previousBalance,
      advancesPaid,
      netPayable,
      breakdown: {
        grossCollections: params.collections.reduce(
          (sum, c) => sum + c.grossAmount,
          0
        ),
        collectionDeductions: params.collections.reduce(
          (sum, c) => sum + c.deductions,
          0
        ),
        additionalDeductions: totalDeductions,
      },
    };
  }

  /**
   * Generates a unique reference number
   */
  static generateReferenceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PAY-${year}${month}${day}-${random}`;
  }

  /**
   * Validates payment data
   */
  static validate(payment: Partial<Payment>): ValidationResult {
    const errors: string[] = [];

    if (!payment.supplierId) {
      errors.push("Supplier is required");
    }
    if (!payment.amount || payment.amount <= 0) {
      errors.push("Amount must be greater than 0");
    }
    if (!payment.paymentType) {
      errors.push("Payment type is required");
    }
    if (!payment.paymentMethod) {
      errors.push("Payment method is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export interface CreatePaymentParams {
  supplierId: string;
  paymentType: PaymentType;
  paymentMethod: "cash" | "bank_transfer" | "cheque";
  amount: number;
  settlementPeriodStart?: Date;
  settlementPeriodEnd?: Date;
  totalCollectionAmount?: number;
  totalDeductions?: number;
  previousBalance?: number;
  advances?: number;
  calculatedAmount?: number;
  notes?: string;
}

export interface SettlementParams {
  collections: Collection[];
  deductions?: number;
  previousBalance?: number;
  advancesPaid?: number;
}

export interface SettlementResult {
  totalCollections: number;
  totalDeductions: number;
  previousBalance: number;
  advancesPaid: number;
  netPayable: number;
  breakdown: {
    grossCollections: number;
    collectionDeductions: number;
    additionalDeductions: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Permission Service - Handles RBAC/ABAC checks
 */
export class PermissionService {
  private static rolePermissions: Record<string, string[]> = {
    admin: ["*"], // All permissions
    manager: [
      "suppliers.read",
      "suppliers.create",
      "suppliers.update",
      "products.read",
      "products.create",
      "products.update",
      "rates.read",
      "rates.create",
      "rates.update",
      "collections.read",
      "collections.create",
      "collections.update",
      "payments.read",
      "payments.create",
      "payments.approve",
      "reports.read",
    ],
    collector: [
      "suppliers.read",
      "products.read",
      "rates.read",
      "collections.read",
      "collections.create",
      "payments.read",
    ],
  };

  /**
   * Checks if user has a specific permission
   */
  static hasPermission(userRole: string, permission: string): boolean {
    const permissions = this.rolePermissions[userRole] || [];

    // Admin has all permissions
    if (permissions.includes("*")) {
      return true;
    }

    return permissions.includes(permission);
  }

  /**
   * Checks ownership-based access (ABAC)
   */
  static canAccessResource(
    user: { id: string; role: string; metadata?: Record<string, unknown> },
    resource: { ownerId?: string; collectorId?: string; region?: string },
    action: "read" | "write" | "delete"
  ): boolean {
    // Admin can access everything
    if (user.role === "admin") {
      return true;
    }

    // Manager can access resources in their region
    if (user.role === "manager") {
      const userRegion = user.metadata?.region as string | undefined;
      if (userRegion && resource.region && userRegion !== resource.region) {
        return false;
      }
      return true;
    }

    // Collector can only access own resources
    if (user.role === "collector") {
      if (resource.collectorId && resource.collectorId !== user.id) {
        return action === "read"; // Can read but not modify
      }
      if (resource.ownerId && resource.ownerId !== user.id) {
        return action === "read";
      }
      return true;
    }

    return false;
  }
}
