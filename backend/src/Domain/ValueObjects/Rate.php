<?php

declare(strict_types=1);

namespace Domain\ValueObjects;

use InvalidArgumentException;

/**
 * Rate Value Object
 * 
 * Represents a price rate per unit with effective date.
 */
final class Rate
{
    private function __construct(
        private readonly Money $price,
        private readonly Unit $unit,
        private readonly \DateTimeImmutable $effectiveFrom
    ) {
        $this->validate();
    }

    public static function from(Money $price, Unit $unit, \DateTimeImmutable $effectiveFrom): self
    {
        return new self($price, $unit, $effectiveFrom);
    }

    public function price(): Money
    {
        return $this->price;
    }

    public function unit(): Unit
    {
        return $this->unit;
    }

    public function effectiveFrom(): \DateTimeImmutable
    {
        return $this->effectiveFrom;
    }

    public function calculateAmount(Quantity $quantity): Money
    {
        if (!$this->unit->isCompatibleWith($quantity->unit())) {
            throw new InvalidArgumentException(
                "Rate unit {$this->unit} is not compatible with quantity unit {$quantity->unit()}"
            );
        }

        $convertedQuantity = $quantity->convertTo($this->unit);
        return $this->price->multiply($convertedQuantity->value());
    }

    public function isEffectiveAt(\DateTimeImmutable $date): bool
    {
        return $this->effectiveFrom <= $date;
    }

    public function equals(Rate $other): bool
    {
        return $this->price->equals($other->price)
            && $this->unit->equals($other->unit)
            && $this->effectiveFrom == $other->effectiveFrom;
    }

    private function validate(): void
    {
        if ($this->price->isNegative()) {
            throw new InvalidArgumentException('Rate price cannot be negative');
        }
    }

    public function toArray(): array
    {
        return [
            'price' => $this->price->toArray(),
            'unit' => $this->unit->symbol(),
            'effective_from' => $this->effectiveFrom->format('Y-m-d H:i:s'),
        ];
    }

    public function __toString(): string
    {
        return sprintf('%s per %s (effective from %s)', 
            $this->price, 
            $this->unit,
            $this->effectiveFrom->format('Y-m-d')
        );
    }
}
