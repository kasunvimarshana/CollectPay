<?php

namespace App\Application\UseCases\Supplier;

use App\Domain\Repositories\SupplierRepositoryInterface;
use InvalidArgumentException;

/**
 * Delete Supplier Use Case
 */
class DeleteSupplierUseCase
{
    public function __construct(
        private SupplierRepositoryInterface $supplierRepository
    ) {}

    public function execute(int $id): bool
    {
        $supplier = $this->supplierRepository->findById($id);
        
        if (!$supplier) {
            throw new InvalidArgumentException("Supplier with ID {$id} not found");
        }

        return $this->supplierRepository->delete($id);
    }
}
