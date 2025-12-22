<?php

namespace Domain\Collection;

use InvalidArgumentException;

/**
 * ProductType Value Object
 */
final class ProductType
{
    private string $name;

    private function __construct(string $name)
    {
        $this->ensureIsNotEmpty($name);
        $this->name = $name;
    }

    public static function fromString(string $name): self
    {
        return new self($name);
    }

    public function name(): string
    {
        return $this->name;
    }

    public function equals(ProductType $other): bool
    {
        return $this->name === $other->name;
    }

    public function __toString(): string
    {
        return $this->name;
    }

    private function ensureIsNotEmpty(string $name): void
    {
        if (empty(trim($name))) {
            throw new InvalidArgumentException("Product type cannot be empty");
        }
    }
}
