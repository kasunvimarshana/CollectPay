<?php

namespace App\Application\UseCases;

use App\Application\DTOs\CreateSupplierDTO;
use App\Domain\Entities\SupplierEntity;
use App\Domain\Repositories\SupplierRepositoryInterface;

/**
 * Create Supplier Use Case
 * 
 * Application service that orchestrates the creation of a supplier.
 * Follows Single Responsibility Principle - does one thing well.
 */
class CreateSupplierUseCase
{
    private SupplierRepositoryInterface $supplierRepository;

    public function __construct(SupplierRepositoryInterface $supplierRepository)
    {
        $this->supplierRepository = $supplierRepository;
    }

    /**
     * Execute the use case
     * 
     * @param CreateSupplierDTO $dto
     * @return SupplierEntity
     * @throws \InvalidArgumentException
     */
    public function execute(CreateSupplierDTO $dto): SupplierEntity
    {
        // Check if code already exists
        if ($this->supplierRepository->codeExists($dto->code)) {
            throw new \InvalidArgumentException("Supplier code '{$dto->code}' already exists");
        }

        // Create domain entity
        $supplier = new SupplierEntity(
            name: $dto->name,
            code: $dto->code,
            address: $dto->address,
            phone: $dto->phone,
            email: $dto->email,
            metadata: $dto->metadata,
            isActive: $dto->isActive
        );

        // Persist through repository
        return $this->supplierRepository->save($supplier);
    }
}
