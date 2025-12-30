<?php

declare(strict_types=1);

namespace Domain\Services;

/**
 * UUID Generator Interface
 * Allows Domain layer to remain framework-independent
 */
interface UuidGeneratorInterface
{
    public function generate(): string;
}
