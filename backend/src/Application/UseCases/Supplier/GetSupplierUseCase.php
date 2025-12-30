<?php

declare(strict_types=1);

namespace Application\UseCases\Supplier;

use Domain\Entities\Supplier;
use Domain\Repositories\SupplierRepositoryInterface;

/**
 * Use Case: Get supplier by ID
 */
final class GetSupplierUseCase
{
    public function __construct(
        private readonly SupplierRepositoryInterface $supplierRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param string $supplierId
     * @return Supplier
     * @throws \InvalidArgumentException
     */
    public function execute(string $supplierId): Supplier
    {
        $supplier = $this->supplierRepository->findById($supplierId);
        
        if (!$supplier) {
            throw new \InvalidArgumentException("Supplier with ID {$supplierId} not found");
        }

        return $supplier;
    }
}
