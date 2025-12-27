<?php

declare(strict_types=1);

namespace TrackVault\Domain\ValueObjects;

use InvalidArgumentException;

/**
 * SupplierId Value Object
 */
final class SupplierId
{
    private string $value;

    public function __construct(string $value)
    {
        if (empty($value)) {
            throw new InvalidArgumentException('SupplierId cannot be empty');
        }
        $this->value = $value;
    }

    public static function generate(): self
    {
        return new self(self::uuid());
    }

    private static function uuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    public function toString(): string
    {
        return $this->value;
    }

    public function equals(SupplierId $other): bool
    {
        return $this->value === $other->value;
    }
}
