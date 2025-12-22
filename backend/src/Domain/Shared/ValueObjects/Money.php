<?php

namespace Domain\Shared\ValueObjects;

use InvalidArgumentException;
use JsonSerializable;

/**
 * Money Value Object - Handles monetary values with precision
 */
final class Money implements JsonSerializable
{
    private int $amount; // Amount in cents
    private string $currency;

    private function __construct(int $amount, string $currency = 'USD')
    {
        $this->ensureIsValidCurrency($currency);
        $this->amount = $amount;
        $this->currency = strtoupper($currency);
    }

    public static function fromCents(int $cents, string $currency = 'USD'): self
    {
        return new self($cents, $currency);
    }

    public static function fromFloat(float $amount, string $currency = 'USD'): self
    {
        return new self((int) round($amount * 100), $currency);
    }

    public function amount(): int
    {
        return $this->amount;
    }

    public function currency(): string
    {
        return $this->currency;
    }

    public function toFloat(): float
    {
        return $this->amount / 100;
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
        return new self((int) round($this->amount * $multiplier), $this->currency);
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
        return $this->amount === $other->amount && $this->currency === $other->currency;
    }

    public function jsonSerialize(): array
    {
        return [
            'amount' => $this->amount,
            'currency' => $this->currency,
            'formatted' => $this->format(),
        ];
    }

    public function format(): string
    {
        return sprintf('%s %.2f', $this->currency, $this->toFloat());
    }

    private function ensureIsValidCurrency(string $currency): void
    {
        $validCurrencies = ['USD', 'EUR', 'GBP', 'INR'];
        if (!in_array(strtoupper($currency), $validCurrencies)) {
            throw new InvalidArgumentException("Invalid currency: {$currency}");
        }
    }

    private function ensureSameCurrency(Money $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException("Cannot operate on different currencies");
        }
    }
}
