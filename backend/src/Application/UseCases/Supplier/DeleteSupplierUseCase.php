<?php

declare(strict_types=1);

namespace Application\UseCases\Supplier;

use Domain\Repositories\SupplierRepositoryInterface;

/**
 * Use Case: Delete a supplier
 */
final class DeleteSupplierUseCase
{
    public function __construct(
        private readonly SupplierRepositoryInterface $supplierRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param string $supplierId
     * @return bool
     * @throws \InvalidArgumentException
     */
    public function execute(string $supplierId): bool
    {
        $supplier = $this->supplierRepository->findById($supplierId);
        
        if (!$supplier) {
            throw new \InvalidArgumentException("Supplier with ID {$supplierId} not found");
        }

        return $this->supplierRepository->delete($supplierId);
    }
}
