/**
 * Unit Value Object
 * Represents measurement units with conversion capabilities
 */

export enum UnitType {
  // Weight units
  KILOGRAM = 'kg',
  GRAM = 'g',
  MILLIGRAM = 'mg',
  POUND = 'lb',
  OUNCE = 'oz',
  
  // Volume units
  LITER = 'l',
  MILLILITER = 'ml',
  GALLON = 'gal',
  
  // Count units
  UNIT = 'unit',
  PIECE = 'piece',
  DOZEN = 'dozen',
}

export class Unit {
  private readonly type: UnitType;

  private constructor(type: UnitType) {
    this.type = type;
  }

  public static create(type: string): Unit {
    const unitType = Object.values(UnitType).find(u => u === type.toLowerCase());
    if (!unitType) {
      throw new Error(`Invalid Unit: ${type} is not a valid unit type`);
    }
    return new Unit(unitType);
  }

  public getType(): UnitType {
    return this.type;
  }

  public isWeight(): boolean {
    return [UnitType.KILOGRAM, UnitType.GRAM, UnitType.MILLIGRAM, UnitType.POUND, UnitType.OUNCE].includes(this.type);
  }

  public isVolume(): boolean {
    return [UnitType.LITER, UnitType.MILLILITER, UnitType.GALLON].includes(this.type);
  }

  public isCount(): boolean {
    return [UnitType.UNIT, UnitType.PIECE, UnitType.DOZEN].includes(this.type);
  }

  public equals(other: Unit): boolean {
    return this.type === other.type;
  }

  public toString(): string {
    return this.type;
  }
}
