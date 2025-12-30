<?php

namespace App\Domain\ValueObjects;

/**
 * Money Value Object
 * 
 * Represents monetary values with currency.
 * Immutable value object for financial calculations.
 */
class Money
{
    private float $amount;
    private string $currency;

    public function __construct(float $amount, string $currency = 'USD')
    {
        $this->validate($amount, $currency);
        $this->amount = round($amount, 2);
        $this->currency = strtoupper($currency);
    }

    private function validate(float $amount, string $currency): void
    {
        if ($amount < 0) {
            throw new \InvalidArgumentException('Money amount cannot be negative');
        }

        if (strlen($currency) !== 3) {
            throw new \InvalidArgumentException('Currency code must be 3 characters (ISO 4217)');
        }
    }

    public function getAmount(): float
    {
        return $this->amount;
    }

    public function getCurrency(): string
    {
        return $this->currency;
    }

    /**
     * Add two money values (must be same currency)
     */
    public function add(Money $other): Money
    {
        if ($this->currency !== $other->currency) {
            throw new \InvalidArgumentException('Cannot add money with different currencies');
        }

        return new Money($this->amount + $other->amount, $this->currency);
    }

    /**
     * Subtract money values (must be same currency)
     */
    public function subtract(Money $other): Money
    {
        if ($this->currency !== $other->currency) {
            throw new \InvalidArgumentException('Cannot subtract money with different currencies');
        }

        $result = $this->amount - $other->amount;
        
        if ($result < 0) {
            throw new \InvalidArgumentException('Subtraction would result in negative money');
        }

        return new Money($result, $this->currency);
    }

    /**
     * Multiply money by a scalar
     */
    public function multiply(float $multiplier): Money
    {
        if ($multiplier < 0) {
            throw new \InvalidArgumentException('Multiplier cannot be negative');
        }

        return new Money($this->amount * $multiplier, $this->currency);
    }

    /**
     * Divide money by a scalar
     */
    public function divide(float $divisor): Money
    {
        if ($divisor <= 0) {
            throw new \InvalidArgumentException('Divisor must be positive');
        }

        return new Money($this->amount / $divisor, $this->currency);
    }

    /**
     * Check if two money values are equal
     */
    public function equals(Money $other): bool
    {
        return $this->currency === $other->currency 
            && abs($this->amount - $other->amount) < 0.01;
    }

    /**
     * Compare two money values
     * Returns: -1 if this < other, 0 if equal, 1 if this > other
     */
    public function compareTo(Money $other): int
    {
        if ($this->currency !== $other->currency) {
            throw new \InvalidArgumentException('Cannot compare money with different currencies');
        }

        $diff = $this->amount - $other->amount;
        
        if (abs($diff) < 0.01) {
            return 0;
        }
        
        return $diff < 0 ? -1 : 1;
    }

    /**
     * Check if this money is greater than another
     */
    public function greaterThan(Money $other): bool
    {
        return $this->compareTo($other) > 0;
    }

    /**
     * Check if this money is less than another
     */
    public function lessThan(Money $other): bool
    {
        return $this->compareTo($other) < 0;
    }

    /**
     * Check if amount is zero
     */
    public function isZero(): bool
    {
        return abs($this->amount) < 0.01;
    }

    public function toString(): string
    {
        return sprintf('%s %.2f', $this->currency, $this->amount);
    }

    public function toArray(): array
    {
        return [
            'amount' => $this->amount,
            'currency' => $this->currency,
        ];
    }

    /**
     * Create from array
     */
    public static function fromArray(array $data): Money
    {
        return new self($data['amount'], $data['currency'] ?? 'USD');
    }

    /**
     * Create zero money
     */
    public static function zero(string $currency = 'USD'): Money
    {
        return new self(0.0, $currency);
    }
}
