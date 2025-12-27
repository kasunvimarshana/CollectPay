export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  bankAccount?: string;
  taxId?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  unit: string;
  rates: ProductRate[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface ProductRate {
  amount: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface Collection {
  id: string;
  supplierId: string;
  productId: string;
  collectorId: string;
  quantity: number;
  unit: string;
  rate: number;
  currency: string;
  totalAmount: number;
  collectionDate: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Payment {
  id: string;
  supplierId: string;
  processedBy: string;
  amount: number;
  currency: string;
  type: 'advance' | 'partial' | 'full';
  paymentMethod: string;
  reference?: string;
  paymentDate: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface SupplierBalance {
  supplierId: string;
  totalOwed: number;
  totalPaid: number;
  balance: number;
  currency: string;
}
