/**
 * UserId Value Object
 * Represents a unique user identifier using UUID
 */

export class UserId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): UserId {
    if (!UserId.isValid(value)) {
      throw new Error('Invalid UserId: must be a valid UUID');
    }
    return new UserId(value);
  }

  public static isValid(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: UserId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
