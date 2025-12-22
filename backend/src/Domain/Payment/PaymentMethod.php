<?php

namespace Domain\Payment;

use InvalidArgumentException;

/**
 * PaymentMethod Value Object
 */
final class PaymentMethod
{
    private string $value;

    private const CASH = 'cash';
    private const BANK_TRANSFER = 'bank_transfer';
    private const CHEQUE = 'cheque';
    private const DIGITAL_WALLET = 'digital_wallet';

    private const VALID_METHODS = [
        self::CASH,
        self::BANK_TRANSFER,
        self::CHEQUE,
        self::DIGITAL_WALLET,
    ];

    private function __construct(string $value)
    {
        $this->ensureIsValid($value);
        $this->value = $value;
    }

    public static function cash(): self
    {
        return new self(self::CASH);
    }

    public static function bankTransfer(): self
    {
        return new self(self::BANK_TRANSFER);
    }

    public static function cheque(): self
    {
        return new self(self::CHEQUE);
    }

    public static function digitalWallet(): self
    {
        return new self(self::DIGITAL_WALLET);
    }

    public static function fromString(string $value): self
    {
        return new self($value);
    }

    public function value(): string
    {
        return $this->value;
    }

    public function equals(PaymentMethod $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }

    private function ensureIsValid(string $value): void
    {
        if (!in_array($value, self::VALID_METHODS)) {
            throw new InvalidArgumentException("Invalid payment method: {$value}");
        }
    }
}
