/**
 * Product Domain Entity
 * 
 * Represents a product in the domain with multi-unit support.
 * Contains business logic and validation rules.
 */
export class ProductEntity {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly code: string,
    public readonly description?: string,
    public readonly defaultUnit: string = 'kg',
    public readonly supportedUnits: string[] = ['kg', 'g'],
    public readonly metadata?: any,
    public readonly isActive: boolean = true,
    public readonly version: number = 1,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {
    this.validate();
  }

  /**
   * Validate business rules
   */
  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Product name is required');
    }

    if (this.name.length > 255) {
      throw new Error('Product name cannot exceed 255 characters');
    }

    if (!this.code || this.code.trim().length === 0) {
      throw new Error('Product code is required');
    }

    if (this.code.length > 255) {
      throw new Error('Product code cannot exceed 255 characters');
    }

    if (!this.defaultUnit || this.defaultUnit.trim().length === 0) {
      throw new Error('Default unit is required');
    }

    if (!this.supportedUnits || this.supportedUnits.length === 0) {
      throw new Error('At least one supported unit is required');
    }

    if (!this.supportedUnits.includes(this.defaultUnit)) {
      throw new Error('Default unit must be in supported units');
    }
  }

  /**
   * Check if unit is supported
   */
  supportsUnit(unit: string): boolean {
    return this.supportedUnits.includes(unit);
  }

  /**
   * Add supported unit
   */
  addSupportedUnit(unit: string): ProductEntity {
    if (this.supportedUnits.includes(unit)) {
      return this;
    }

    return new ProductEntity(
      this.id,
      this.name,
      this.code,
      this.description,
      this.defaultUnit,
      [...this.supportedUnits, unit],
      this.metadata,
      this.isActive,
      this.version + 1,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Create a copy with updated fields
   */
  update(updates: Partial<Omit<ProductEntity, 'id' | 'code' | 'version'>>): ProductEntity {
    return new ProductEntity(
      this.id,
      updates.name ?? this.name,
      this.code,
      updates.description ?? this.description,
      updates.defaultUnit ?? this.defaultUnit,
      updates.supportedUnits ?? this.supportedUnits,
      updates.metadata ?? this.metadata,
      updates.isActive ?? this.isActive,
      this.version + 1,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Create entity from API response
   */
  static fromApiResponse(data: any): ProductEntity {
    return new ProductEntity(
      data.id,
      data.name,
      data.code,
      data.description,
      data.default_unit,
      data.supported_units || [],
      data.metadata,
      data.is_active ?? true,
      data.version ?? 1,
      data.created_at ? new Date(data.created_at) : undefined,
      data.updated_at ? new Date(data.updated_at) : undefined
    );
  }

  /**
   * Convert to API format
   */
  toApiFormat(): any {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      description: this.description,
      default_unit: this.defaultUnit,
      supported_units: this.supportedUnits,
      metadata: this.metadata,
      is_active: this.isActive,
      version: this.version,
    };
  }
}
