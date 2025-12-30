<?php

namespace App\Application\UseCases\Supplier;

use App\Domain\Repositories\SupplierRepositoryInterface;

/**
 * Delete Supplier Use Case
 *
 * Handles the deletion of a supplier.
 */
class DeleteSupplierUseCase
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
     * @throws \RuntimeException
     */
    public function execute(int $id): bool
    {
        if (! $this->repository->exists($id)) {
            throw new \InvalidArgumentException("Supplier with ID {$id} not found");
        }

        try {
            return $this->repository->delete($id);
        } catch (\Exception $e) {
            throw new \RuntimeException('Failed to delete supplier: '.$e->getMessage(), 0, $e);
        }
    }
}
