<?php

declare(strict_types=1);

namespace TrackVault\Domain\ValueObjects;

use InvalidArgumentException;

/**
 * Money Value Object
 */
final class Money
{
    private float $amount;
    private string $currency;

    public function __construct(float $amount, string $currency = 'USD')
    {
        if ($amount < 0) {
            throw new InvalidArgumentException('Money amount cannot be negative');
        }
        
        if (empty($currency)) {
            throw new InvalidArgumentException('Currency cannot be empty');
        }
        
        $this->amount = round($amount, 2);
        $this->currency = strtoupper($currency);
    }

    public function getAmount(): float
    {
        return $this->amount;
    }

    public function getCurrency(): string
    {
        return $this->currency;
    }

    public function add(Money $other): self
    {
        $this->assertSameCurrency($other);
        return new self($this->amount + $other->amount, $this->currency);
    }

    public function subtract(Money $other): self
    {
        $this->assertSameCurrency($other);
        return new self($this->amount - $other->amount, $this->currency);
    }

    public function multiply(float $multiplier): self
    {
        return new self($this->amount * $multiplier, $this->currency);
    }

    public function divide(float $divisor): self
    {
        if ($divisor == 0) {
            throw new InvalidArgumentException('Cannot divide by zero');
        }
        return new self($this->amount / $divisor, $this->currency);
    }

    public function equals(Money $other): bool
    {
        return $this->amount === $other->amount && $this->currency === $other->currency;
    }

    public function greaterThan(Money $other): bool
    {
        $this->assertSameCurrency($other);
        return $this->amount > $other->amount;
    }

    public function lessThan(Money $other): bool
    {
        $this->assertSameCurrency($other);
        return $this->amount < $other->amount;
    }

    private function assertSameCurrency(Money $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException(
                "Cannot perform operation on different currencies: {$this->currency} and {$other->currency}"
            );
        }
    }

    public function toString(): string
    {
        return sprintf('%s %.2f', $this->currency, $this->amount);
    }
}
