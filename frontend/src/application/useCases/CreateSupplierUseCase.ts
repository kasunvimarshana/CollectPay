import { SupplierEntity } from '../../domain/entities/SupplierEntity';
import { ISupplierRepository } from '../../domain/interfaces/ISupplierRepository';
import { DuplicateEntityException, ValidationException } from '../../domain/exceptions/DomainExceptions';

/**
 * Create Supplier DTO
 * 
 * Data transfer object for creating suppliers.
 */
export interface CreateSupplierDTO {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  metadata?: any;
  is_active?: boolean;
}

/**
 * Create Supplier Use Case
 * 
 * Handles the business logic for creating a new supplier.
 * Orchestrates domain entities and repository operations.
 */
export class CreateSupplierUseCase {
  constructor(private readonly supplierRepository: ISupplierRepository) {}

  /**
   * Execute the use case
   * 
   * @param data Supplier creation data
   * @returns Created supplier entity
   * @throws ValidationException if validation fails
   * @throws DuplicateEntityException if code already exists
   */
  async execute(data: CreateSupplierDTO): Promise<SupplierEntity> {
    // Validate input
    this.validateInput(data);

    // Check for duplicate code
    await this.ensureUniqueCode(data.code);

    // Create supplier data for entity validation
    const supplierData = {
      id: 0, // Temporary ID, will be assigned by backend
      name: data.name,
      code: data.code,
      address: data.address,
      phone: data.phone,
      email: data.email,
      metadata: data.metadata,
      isActive: data.is_active ?? true,
      version: 1,
    };

    // Validate through entity constructor (will throw ValidationException if invalid)
    try {
      new SupplierEntity(
        supplierData.id,
        supplierData.name,
        supplierData.code,
        supplierData.address,
        supplierData.phone,
        supplierData.email,
        supplierData.metadata,
        supplierData.isActive,
        supplierData.version
      );
    } catch (error) {
      // Re-throw validation errors
      if (error instanceof ValidationException) {
        throw error;
      }
      throw new ValidationException(error instanceof Error ? error.message : 'Validation failed');
    }

    // Persist through repository
    return await this.supplierRepository.create(supplierData);
  }

  /**
   * Validate input data
   */
  private validateInput(data: CreateSupplierDTO): void {
    if (!data.name?.trim()) {
      throw new ValidationException('Supplier name is required');
    }

    if (!data.code?.trim()) {
      throw new ValidationException('Supplier code is required');
    }
  }

  /**
   * Ensure supplier code is unique
   */
  private async ensureUniqueCode(code: string): Promise<void> {
    const existing = await this.supplierRepository.findByCode(code);
    if (existing) {
      throw new DuplicateEntityException('Supplier', 'code', code);
    }
  }
}
