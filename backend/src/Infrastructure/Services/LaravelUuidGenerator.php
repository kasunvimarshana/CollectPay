<?php

declare(strict_types=1);

namespace Infrastructure\Services;

use Domain\Services\UuidGeneratorInterface;
use Illuminate\Support\Str;

/**
 * Laravel UUID Generator Implementation
 */
final class LaravelUuidGenerator implements UuidGeneratorInterface
{
    public function generate(): string
    {
        return Str::uuid()->toString();
    }
}
