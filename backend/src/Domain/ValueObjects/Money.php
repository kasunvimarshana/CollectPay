<?php

declare(strict_types=1);

namespace Domain\ValueObjects;

use InvalidArgumentException;

/**
 * Money Value Object
 * 
 * Represents monetary amounts with validation
 * Immutable value object following DDD principles
 */
final class Money
{
    private float $amount;
    private string $currency;

    public function __construct(float $amount, string $currency = 'LKR')
    {
        $this->validateAmount($amount);
        $this->validateCurrency($currency);
        
        $this->amount = round($amount, 2);
        $this->currency = strtoupper($currency);
    }

    private function validateAmount(float $amount): void
    {
        if ($amount < 0) {
            throw new InvalidArgumentException('Money amount cannot be negative');
        }
    }

    private function validateCurrency(string $currency): void
    {
        if (empty(trim($currency))) {
            throw new InvalidArgumentException('Currency cannot be empty');
        }

        if (strlen($currency) !== 3) {
            throw new InvalidArgumentException('Currency must be a 3-letter ISO code');
        }
    }

    public function amount(): float
    {
        return $this->amount;
    }

    public function currency(): string
    {
        return $this->currency;
    }

    public function add(Money $other): self
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException('Cannot add money with different currencies');
        }

        return new self($this->amount + $other->amount, $this->currency);
    }

    public function subtract(Money $other): self
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException('Cannot subtract money with different currencies');
        }

        return new self($this->amount - $other->amount, $this->currency);
    }

    public function multiply(float $multiplier): self
    {
        return new self($this->amount * $multiplier, $this->currency);
    }

    public function equals(Money $other): bool
    {
        return $this->amount === $other->amount && $this->currency === $other->currency;
    }

    public function formatted(): string
    {
        return sprintf('%s %.2f', $this->currency, $this->amount);
    }

    public function __toString(): string
    {
        return $this->formatted();
    }
}
