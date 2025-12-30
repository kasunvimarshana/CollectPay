<?php

namespace App\Application\UseCases\Supplier;

use App\Application\DTOs\SupplierDTO;
use App\Domain\Entities\Supplier;
use App\Domain\Repositories\SupplierRepositoryInterface;

/**
 * Get Supplier Use Case
 */
class GetSupplierUseCase
{
    public function __construct(
        private SupplierRepositoryInterface $supplierRepository
    ) {}

    public function execute(int $id): ?SupplierDTO
    {
        $supplier = $this->supplierRepository->findById($id);
        
        if (!$supplier) {
            return null;
        }

        return $this->entityToDTO($supplier);
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
