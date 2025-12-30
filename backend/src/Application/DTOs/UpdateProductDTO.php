<?php

declare(strict_types=1);

namespace Application\DTOs;

final class UpdateProductDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $unit,
        public readonly ?string $description = null
    ) {}
}
