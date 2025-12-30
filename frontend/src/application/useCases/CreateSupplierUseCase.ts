/**
 * Create Supplier Use Case
 * Application layer use case for creating a new supplier
 */

import { Supplier } from '../../domain/entities/Supplier';
import { SupplierRepository } from '../../domain/repositories/SupplierRepository';

export interface CreateSupplierDTO {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
}

export class CreateSupplierUseCase {
  constructor(private supplierRepository: SupplierRepository) {}

  async execute(dto: CreateSupplierDTO): Promise<Supplier> {
    // Validation
    if (!dto.name || dto.name.trim().length === 0) {
      throw new Error('Supplier name is required');
    }
    if (!dto.code || dto.code.trim().length === 0) {
      throw new Error('Supplier code is required');
    }

    // Create supplier entity with temporary ID (will be replaced by backend)
    const supplier = Supplier.create(
      'temp-' + Date.now(),
      dto.name,
      dto.code,
      dto.address,
      dto.phone,
      dto.email
    );

    // Persist via repository
    return await this.supplierRepository.create(supplier);
  }
}
