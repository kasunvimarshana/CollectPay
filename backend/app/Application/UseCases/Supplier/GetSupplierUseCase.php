<?php

namespace App\Application\UseCases\Supplier;

use App\Domain\Entities\SupplierEntity;
use App\Domain\Repositories\SupplierRepositoryInterface;

/**
 * Get Supplier Use Case
 *
 * Retrieves a single supplier by ID.
 */
class GetSupplierUseCase
{
    private SupplierRepositoryInterface $repository;

    public function __construct(SupplierRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Execute the use case
     *
     * @throws \InvalidArgumentException
     */
    public function execute(int $id): SupplierEntity
    {
        $supplier = $this->repository->findById($id);

        if ($supplier === null) {
            throw new \InvalidArgumentException("Supplier with ID {$id} not found");
        }

        return $supplier;
    }
}
