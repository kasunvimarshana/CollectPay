/**
 * Email Value Object
 * Represents a validated email address
 */

export class Email {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): Email {
    if (!Email.isValid(value)) {
      throw new Error('Invalid Email: must be a valid email address');
    }
    return new Email(value.toLowerCase().trim());
  }

  public static isValid(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
