<?php

declare(strict_types=1);

namespace Application\UseCases\Supplier;

use Domain\Entities\Supplier;
use Domain\Repositories\SupplierRepositoryInterface;
use Domain\ValueObjects\UUID;
use InvalidArgumentException;

/**
 * Get Supplier Use Case
 * 
 * Application service for retrieving a single supplier
 */
final class GetSupplierUseCase
{
    public function __construct(
        private readonly SupplierRepositoryInterface $repository
    ) {
    }

    public function execute(string $id): Supplier
    {
        $uuid = UUID::fromString($id);
        $supplier = $this->repository->findById($uuid);

        if (!$supplier) {
            throw new InvalidArgumentException("Supplier not found with ID: {$id}");
        }

        return $supplier;
    }
}
