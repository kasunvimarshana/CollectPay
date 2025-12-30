<?php

namespace App\Application\UseCases\Supplier;

use App\Application\DTOs\SupplierDTO;
use App\Domain\Entities\Supplier;
use App\Domain\Repositories\SupplierRepositoryInterface;

/**
 * List Suppliers Use Case
 */
class ListSuppliersUseCase
{
    public function __construct(
        private SupplierRepositoryInterface $supplierRepository
    ) {}

    public function execute(array $filters = [], int $page = 1, int $perPage = 50): array
    {
        $suppliers = $this->supplierRepository->findAll($filters, $page, $perPage);
        $total = $this->supplierRepository->count($filters);

        return [
            'data' => array_map(
                fn($supplier) => $this->entityToDTO($supplier),
                $suppliers
            ),
            'meta' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => ceil($total / $perPage)
            ]
        ];
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
