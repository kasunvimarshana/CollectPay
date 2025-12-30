<?php

namespace App\Application\UseCases\Supplier;

use App\Application\DTOs\SupplierDTO;
use App\Domain\Entities\SupplierEntity;
use App\Domain\Repositories\SupplierRepositoryInterface;

/**
 * Create Supplier Use Case
 *
 * Encapsulates the business logic for creating a new supplier.
 * This follows Single Responsibility Principle (SOLID).
 */
class CreateSupplierUseCase
{
    private SupplierRepositoryInterface $repository;

    public function __construct(SupplierRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Execute the use case
     *
     * @throws \InvalidArgumentException
     * @throws \RuntimeException
     */
    public function execute(SupplierDTO $dto): SupplierEntity
    {
        // Business rule: Code must be unique
        if (! $this->repository->isCodeUnique($dto->code)) {
            throw new \InvalidArgumentException("Supplier code '{$dto->code}' already exists");
        }

        // Create domain entity
        $supplier = new SupplierEntity(
            name: $dto->name,
            code: $dto->code,
            contactPerson: $dto->contactPerson,
            phone: $dto->phone,
            email: $dto->email,
            address: $dto->address,
            city: $dto->city,
            state: $dto->state,
            country: $dto->country,
            postalCode: $dto->postalCode,
            status: $dto->status
        );

        // Persist the entity
        try {
            return $this->repository->save($supplier);
        } catch (\Exception $e) {
            throw new \RuntimeException('Failed to create supplier: '.$e->getMessage(), 0, $e);
        }
    }
}
