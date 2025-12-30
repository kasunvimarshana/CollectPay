<?php

declare(strict_types=1);

namespace Application\UseCases\Supplier;

use Application\DTOs\CreateSupplierDTO;
use Domain\Entities\Supplier;
use Domain\Repositories\SupplierRepositoryInterface;
use InvalidArgumentException;

/**
 * Create Supplier Use Case
 * 
 * Application service for creating suppliers
 * Follows Single Responsibility Principle
 */
final class CreateSupplierUseCase
{
    public function __construct(
        private readonly SupplierRepositoryInterface $repository
    ) {
    }

    public function execute(CreateSupplierDTO $dto): Supplier
    {
        // Business rule: Supplier code must be unique
        if ($this->repository->codeExists($dto->code)) {
            throw new InvalidArgumentException("Supplier code '{$dto->code}' already exists");
        }

        $supplier = Supplier::create(
            $dto->name,
            $dto->code,
            $dto->email,
            $dto->phone,
            $dto->address
        );

        $this->repository->save($supplier);

        return $supplier;
    }
}
