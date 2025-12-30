/**
 * List Suppliers Use Case
 */

import { Supplier } from '../../domain/entities/Supplier';
import { SupplierRepository } from '../../domain/repositories/SupplierRepository';

export class ListSuppliersUseCase {
  constructor(private supplierRepository: SupplierRepository) {}

  async execute(): Promise<Supplier[]> {
    return await this.supplierRepository.findAll();
  }
}
