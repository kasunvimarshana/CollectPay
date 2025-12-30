<?php

namespace App\Application\UseCases\Supplier;

use App\Domain\Repositories\SupplierRepositoryInterface;

/**
 * List Suppliers Use Case
 *
 * Retrieves a list of suppliers with filtering and pagination.
 */
class ListSuppliersUseCase
{
    private SupplierRepositoryInterface $repository;

    public function __construct(SupplierRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Execute the use case
     */
    public function execute(array $filters = [], int $page = 1, int $perPage = 15): array
    {
        return $this->repository->getAll($filters, $page, $perPage);
    }
}
