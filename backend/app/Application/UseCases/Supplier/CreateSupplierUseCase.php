<?php

namespace App\Application\UseCases\Supplier;

use App\Application\DTOs\SupplierDTO;
use App\Domain\Entities\Supplier;
use App\Domain\Repositories\SupplierRepositoryInterface;
use InvalidArgumentException;

/**
 * Create Supplier Use Case
 * 
 * Handles the creation of a new supplier
 */
class CreateSupplierUseCase
{
    public function __construct(
        private SupplierRepositoryInterface $supplierRepository
    ) {}

    public function execute(SupplierDTO $dto): SupplierDTO
    {
        // Validate that code doesn't already exist
        if ($this->supplierRepository->codeExists($dto->code)) {
            throw new InvalidArgumentException("Supplier code '{$dto->code}' already exists");
        }

        // Create domain entity
        $supplier = new Supplier(
            name: $dto->name,
            code: $dto->code,
            address: $dto->address,
            phone: $dto->phone,
            email: $dto->email,
            contactPerson: $dto->contactPerson,
            isActive: $dto->isActive,
            createdBy: $dto->createdBy
        );

        // Save to repository
        $savedSupplier = $this->supplierRepository->save($supplier);

        // Convert back to DTO
        return $this->entityToDTO($savedSupplier);
    }

    private function entityToDTO(Supplier $supplier): SupplierDTO
    {
        return new SupplierDTO(
            id: $supplier->getId(),
            name: $supplier->getName(),
            code: $supplier->getCode(),
            address: $supplier->getAddress(),
            phone: $supplier->getPhone(),
            email: $supplier->getEmail(),
            contactPerson: $supplier->getContactPerson(),
            isActive: $supplier->isActive(),
            createdBy: $supplier->getCreatedBy(),
            createdAt: $supplier->getCreatedAt()->format('Y-m-d H:i:s'),
            updatedAt: $supplier->getUpdatedAt()->format('Y-m-d H:i:s')
        );
    }
}
