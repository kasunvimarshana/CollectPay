<?php

namespace App\Domain\ValueObjects;

/**
 * Money Value Object
 * 
 * Immutable value object representing monetary amounts.
 * Ensures precision and consistency in financial calculations.
 */
class Money
{
    private float $amount;
    private string $currency;
    private int $precision;

    public function __construct(float $amount, string $currency = 'USD', int $precision = 2)
    {
        if ($amount < 0) {
            throw new \InvalidArgumentException('Amount cannot be negative');
        }

        $this->amount = round($amount, $precision);
        $this->currency = $currency;
        $this->precision = $precision;
    }

    public function getAmount(): float
    {
        return $this->amount;
    }

    public function getCurrency(): string
    {
        return $this->currency;
    }

    public function getPrecision(): int
    {
        return $this->precision;
    }

    public function add(Money $other): Money
    {
        $this->ensureSameCurrency($other);
        return new Money($this->amount + $other->amount, $this->currency, $this->precision);
    }

    public function subtract(Money $other): Money
    {
        $this->ensureSameCurrency($other);
        $result = $this->amount - $other->amount;
        
        if ($result < 0) {
            throw new \InvalidArgumentException('Subtraction would result in negative amount');
        }
        
        return new Money($result, $this->currency, $this->precision);
    }

    public function multiply(float $multiplier): Money
    {
        if ($multiplier < 0) {
            throw new \InvalidArgumentException('Multiplier cannot be negative');
        }
        
        return new Money($this->amount * $multiplier, $this->currency, $this->precision);
    }

    public function divide(float $divisor): Money
    {
        if ($divisor <= 0) {
            throw new \InvalidArgumentException('Divisor must be greater than zero');
        }
        
        return new Money($this->amount / $divisor, $this->currency, $this->precision);
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

    public function equals(Money $other): bool
    {
        return $this->currency === $other->currency 
            && abs($this->amount - $other->amount) < PHP_FLOAT_EPSILON;
    }

    public function isZero(): bool
    {
        return abs($this->amount) < PHP_FLOAT_EPSILON;
    }

    private function ensureSameCurrency(Money $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new \InvalidArgumentException(
                "Cannot perform operation on different currencies: {$this->currency} and {$other->currency}"
            );
        }
    }

    public function format(): string
    {
        return number_format($this->amount, $this->precision) . ' ' . $this->currency;
    }

    public function __toString(): string
    {
        return $this->format();
    }
}
