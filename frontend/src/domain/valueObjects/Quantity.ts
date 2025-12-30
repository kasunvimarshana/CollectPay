/**
 * Quantity Value Object
 * Represents a quantity with a unit of measurement
 */

import { Unit, UnitType } from './Unit';

export class Quantity {
  private readonly value: number;
  private readonly unit: Unit;

  private constructor(value: number, unit: Unit) {
    this.value = value;
    this.unit = unit;
  }

  public static create(value: number, unitType: string): Quantity {
    if (value < 0) {
      throw new Error('Invalid Quantity: value cannot be negative');
    }
    const unit = Unit.create(unitType);
    return new Quantity(value, unit);
  }

  public getValue(): number {
    return this.value;
  }

  public getUnit(): Unit {
    return this.unit;
  }

  public convertTo(targetUnitType: string): Quantity {
    const targetUnit = Unit.create(targetUnitType);
    
    // Can only convert within same category
    if (this.unit.isWeight() && !targetUnit.isWeight()) {
      throw new Error('Cannot convert weight to non-weight unit');
    }
    if (this.unit.isVolume() && !targetUnit.isVolume()) {
      throw new Error('Cannot convert volume to non-volume unit');
    }
    if (this.unit.isCount() && !targetUnit.isCount()) {
      throw new Error('Cannot convert count to non-count unit');
    }

    // Convert to base unit first (kg for weight, l for volume, unit for count)
    const baseValue = this.toBaseUnit();
    
    // Then convert to target unit
    const targetValue = this.fromBaseUnit(baseValue, targetUnit);
    
    return new Quantity(targetValue, targetUnit);
  }

  private toBaseUnit(): number {
    const unitType = this.unit.getType();
    
    // Weight conversions to kg
    switch (unitType) {
      case UnitType.KILOGRAM: return this.value;
      case UnitType.GRAM: return this.value / 1000;
      case UnitType.MILLIGRAM: return this.value / 1000000;
      case UnitType.POUND: return this.value * 0.453592;
      case UnitType.OUNCE: return this.value * 0.0283495;
      
      // Volume conversions to liter
      case UnitType.LITER: return this.value;
      case UnitType.MILLILITER: return this.value / 1000;
      case UnitType.GALLON: return this.value * 3.78541;
      
      // Count conversions to unit
      case UnitType.UNIT: return this.value;
      case UnitType.PIECE: return this.value;
      case UnitType.DOZEN: return this.value * 12;
      
      default: return this.value;
    }
  }

  private fromBaseUnit(baseValue: number, targetUnit: Unit): number {
    const unitType = targetUnit.getType();
    
    // Weight conversions from kg
    switch (unitType) {
      case UnitType.KILOGRAM: return baseValue;
      case UnitType.GRAM: return baseValue * 1000;
      case UnitType.MILLIGRAM: return baseValue * 1000000;
      case UnitType.POUND: return baseValue / 0.453592;
      case UnitType.OUNCE: return baseValue / 0.0283495;
      
      // Volume conversions from liter
      case UnitType.LITER: return baseValue;
      case UnitType.MILLILITER: return baseValue * 1000;
      case UnitType.GALLON: return baseValue / 3.78541;
      
      // Count conversions from unit
      case UnitType.UNIT: return baseValue;
      case UnitType.PIECE: return baseValue;
      case UnitType.DOZEN: return baseValue / 12;
      
      default: return baseValue;
    }
  }

  public toString(): string {
    return `${this.value} ${this.unit.toString()}`;
  }

  public toJSON() {
    return {
      value: this.value,
      unit: this.unit.toString(),
    };
  }
}
