<?php

namespace App\Application\UseCases\Supplier;

use App\Application\DTOs\SupplierDTO;
use App\Domain\Entities\Supplier;
use App\Domain\Repositories\SupplierRepositoryInterface;
use InvalidArgumentException;

/**
 * Update Supplier Use Case
 */
class UpdateSupplierUseCase
{
    public function __construct(
        private SupplierRepositoryInterface $supplierRepository
    ) {}

    public function execute(int $id, SupplierDTO $dto): SupplierDTO
    {
        // Find existing supplier
        $supplier = $this->supplierRepository->findById($id);
        
        if (!$supplier) {
            throw new InvalidArgumentException("Supplier with ID {$id} not found");
        }

        // Validate that code doesn't exist for other suppliers
        if ($dto->code !== $supplier->getCode() && 
            $this->supplierRepository->codeExists($dto->code, $id)) {
            throw new InvalidArgumentException("Supplier code '{$dto->code}' already exists");
        }

        // Update entity
        $supplier->updateDetails(
            name: $dto->name,
            address: $dto->address,
            phone: $dto->phone,
            email: $dto->email,
            contactPerson: $dto->contactPerson
        );

        // Handle active status changes
        if ($dto->isActive && !$supplier->isActive()) {
            $supplier->activate();
        } elseif (!$dto->isActive && $supplier->isActive()) {
            $supplier->deactivate();
        }

        // Save to repository
        $updatedSupplier = $this->supplierRepository->update($supplier);

        // Convert back to DTO
        return $this->entityToDTO($updatedSupplier);
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
