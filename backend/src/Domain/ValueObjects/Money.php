<?php

namespace App\Domain\ValueObjects;

/**
 * Money Value Object
 * 
 * Immutable value object representing monetary amounts.
 * Ensures consistency in money calculations.
 */
final class Money
{
    private function __construct(
        private readonly float $amount,
        private readonly string $currency = 'USD'
    ) {
        if ($amount < 0) {
            throw new \InvalidArgumentException('Amount cannot be negative');
        }
    }

    public static function from(float $amount, string $currency = 'USD'): self
    {
        return new self(round($amount, 2), strtoupper($currency));
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

    public function isGreaterThan(Money $other): bool
    {
        $this->assertSameCurrency($other);
        return $this->amount > $other->amount;
    }

    public function isLessThan(Money $other): bool
    {
        $this->assertSameCurrency($other);
        return $this->amount < $other->amount;
    }

    public function equals(Money $other): bool
    {
        return $this->amount === $other->amount 
            && $this->currency === $other->currency;
    }

    private function assertSameCurrency(Money $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new \InvalidArgumentException(
                'Cannot operate on different currencies'
            );
        }
    }

    public function format(): string
    {
        return sprintf('%s %.2f', $this->currency, $this->amount);
    }

    public function __toString(): string
    {
        return $this->format();
    }
}
