/**
 * Supplier Domain Entity
 * 
 * Represents a supplier in the domain model
 * Immutable and contains business logic
 */
export interface Supplier {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly address: string | null;
  readonly active: boolean;
  readonly version: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Create a new Supplier entity from API data
 */
export function createSupplier(data: any): Supplier {
  return {
    id: data.id,
    name: data.name,
    code: data.code,
    email: data.email || null,
    phone: data.phone || null,
    address: data.address || null,
    active: data.active ?? true,
    version: data.version || 1,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}
