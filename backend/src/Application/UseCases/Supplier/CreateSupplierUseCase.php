<?php

namespace App\Application\UseCases\Supplier;

use App\Domain\Entities\Supplier;
use App\Domain\Repositories\SupplierRepositoryInterface;

/**
 * Create Supplier Use Case
 */
class CreateSupplierUseCase
{
    public function __construct(
        private readonly SupplierRepositoryInterface $supplierRepository
    ) {}

    public function execute(
        string $name,
        string $contact,
        string $address,
        array $metadata = []
    ): Supplier {
        $supplier = new Supplier(
            null,
            $name,
            $contact,
            $address,
            $metadata
        );

        return $this->supplierRepository->save($supplier);
    }
}
