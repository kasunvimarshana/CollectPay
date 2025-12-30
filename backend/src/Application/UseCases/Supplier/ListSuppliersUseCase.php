<?php

declare(strict_types=1);

namespace Application\UseCases\Supplier;

use Domain\Repositories\SupplierRepositoryInterface;

/**
 * Use Case: List all suppliers
 */
final class ListSuppliersUseCase
{
    public function __construct(
        private readonly SupplierRepositoryInterface $supplierRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param int $page
     * @param int $perPage
     * @param array $filters
     * @return array
     */
    public function execute(int $page = 1, int $perPage = 15, array $filters = []): array
    {
        return $this->supplierRepository->findAll($page, $perPage, $filters);
    }
}
