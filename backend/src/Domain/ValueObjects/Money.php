<?php

declare(strict_types=1);

namespace Domain\ValueObjects;

use InvalidArgumentException;

/**
 * Money Value Object
 * 
 * Represents a monetary value with currency support.
 * Immutable and validated.
 */
final class Money
{
    private function __construct(
        private readonly float $amount,
        private readonly string $currency = 'USD'
    ) {
        $this->validate();
    }

    public static function from(float $amount, string $currency = 'USD'): self
    {
        return new self($amount, $currency);
    }

    public static function zero(string $currency = 'USD'): self
    {
        return new self(0.0, $currency);
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
        $this->ensureSameCurrency($other);
        return new self($this->amount + $other->amount, $this->currency);
    }

    public function subtract(Money $other): self
    {
        $this->ensureSameCurrency($other);
        return new self($this->amount - $other->amount, $this->currency);
    }

    public function multiply(float $multiplier): self
    {
        return new self($this->amount * $multiplier, $this->currency);
    }

    public function equals(Money $other): bool
    {
        return $this->amount === $other->amount 
            && $this->currency === $other->currency;
    }

    public function isGreaterThan(Money $other): bool
    {
        $this->ensureSameCurrency($other);
        return $this->amount > $other->amount;
    }

    public function isLessThan(Money $other): bool
    {
        $this->ensureSameCurrency($other);
        return $this->amount < $other->amount;
    }

    public function isNegative(): bool
    {
        return $this->amount < 0;
    }

    public function isPositive(): bool
    {
        return $this->amount > 0;
    }

    public function isZero(): bool
    {
        return $this->amount === 0.0;
    }

    private function validate(): void
    {
        if (strlen($this->currency) !== 3) {
            throw new InvalidArgumentException('Currency must be a 3-letter code');
        }
    }

    private function ensureSameCurrency(Money $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException(
                "Cannot operate on different currencies: {$this->currency} and {$other->currency}"
            );
        }
    }

    public function toArray(): array
    {
        return [
            'amount' => $this->amount,
            'currency' => $this->currency,
        ];
    }

    public function __toString(): string
    {
        return sprintf('%s %.2f', $this->currency, $this->amount);
    }
}
