<?php

declare(strict_types=1);

namespace Application\DTOs;

final class CreateProductDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $code,
        public readonly string $unit,
        public readonly ?string $description = null
    ) {}
}
