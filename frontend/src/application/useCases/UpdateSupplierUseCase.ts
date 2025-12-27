import { SupplierEntity } from '../../domain/entities/SupplierEntity';
import { ISupplierRepository } from '../../domain/interfaces/ISupplierRepository';

/**
 * Update Supplier DTO
 * 
 * Data transfer object for updating suppliers.
 */
export interface UpdateSupplierDTO {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  metadata?: any;
  is_active?: boolean;
  version: number; // Required for optimistic locking
}

/**
 * Update Supplier Use Case
 * 
 * Handles the business logic for updating an existing supplier.
 * Implements optimistic locking through version control.
 */
export class UpdateSupplierUseCase {
  constructor(private readonly supplierRepository: ISupplierRepository) {}

  /**
   * Execute the use case
   * 
   * @param id Supplier ID
   * @param data Supplier update data
   * @returns Updated supplier entity
   * @throws Error if validation fails or version conflict occurs
   */
  async execute(id: number, data: UpdateSupplierDTO): Promise<SupplierEntity> {
    // Validate input
    this.validateInput(data);

    // Get current supplier to check version
    const current = await this.supplierRepository.getById(id);

    // Check for version conflict (optimistic locking)
    if (current.version !== data.version) {
      throw new Error(
        'Version conflict: The supplier has been modified by another user. Please refresh and try again.'
      );
    }

    // Validate updates by creating a temporary entity
    if (data.name !== undefined) {
      current.update({ name: data.name });
    }

    // Persist through repository
    return await this.supplierRepository.update(id, {
      ...data,
      version: data.version,
    });
  }

  /**
   * Validate input data
   */
  private validateInput(data: UpdateSupplierDTO): void {
    if (data.name !== undefined && !data.name?.trim()) {
      throw new Error('Supplier name cannot be empty');
    }

    if (data.version === undefined) {
      throw new Error('Version is required for update');
    }

    if (data.version < 1) {
      throw new Error('Invalid version number');
    }
  }
}
