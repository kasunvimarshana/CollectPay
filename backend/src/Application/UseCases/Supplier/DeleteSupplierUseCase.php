<?php

declare(strict_types=1);

namespace Application\UseCases\Supplier;

use Domain\Repositories\SupplierRepositoryInterface;
use Domain\ValueObjects\UUID;
use InvalidArgumentException;

/**
 * Delete Supplier Use Case
 * 
 * Application service for deleting suppliers
 */
final class DeleteSupplierUseCase
{
    public function __construct(
        private readonly SupplierRepositoryInterface $repository
    ) {
    }

    public function execute(string $id): void
    {
        $uuid = UUID::fromString($id);
        
        $supplier = $this->repository->findById($uuid);
        if (!$supplier) {
            throw new InvalidArgumentException("Supplier not found with ID: {$id}");
        }

        $this->repository->delete($uuid);
    }
}
