export type Unit = "g" | "kg" | "l" | "ml";

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[]; // RBAC
  attributes?: Record<string, string | number | boolean>; // ABAC
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  location?: {
    lat: number;
    lng: number;
  };
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  unit: Unit;
}

export type ScheduleType = "daily" | "weekly" | "biweekly" | "custom";

export interface CollectionSchedule {
  id: string;
  supplierId: string;
  productId: string;
  type: ScheduleType;
  customCron?: string; // e.g., "0 8 * * 1,3"
  startDate: string; // ISO
  endDate?: string; // ISO
}

export interface Rate {
  id: string;
  supplierId: string;
  productId: string;
  pricePerUnit: number; // e.g., per kg or per l
  currency: string; // ISO currency code
  effectiveFrom: string; // ISO
  effectiveTo?: string; // ISO
}

export interface Collection {
  id: string;
  supplierId: string;
  productId: string;
  quantity: number;
  unit: Unit;
  collectedAt: string; // ISO
  notes?: string;
  synced: boolean;
}

export interface Payment {
  id: string;
  supplierId: string;
  amount: number;
  currency: string;
  type: "advance" | "partial" | "final";
  reference?: string;
  paidAt: string; // ISO
  synced: boolean;
}

export interface SyncRecord {
  id: string;
  entity:
    | "supplier"
    | "product"
    | "schedule"
    | "rate"
    | "collection"
    | "payment";
  payload: any;
  createdAt: number;
}
