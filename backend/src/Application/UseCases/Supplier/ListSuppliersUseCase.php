<?php

declare(strict_types=1);

namespace Application\UseCases\Supplier;

use Domain\Repositories\SupplierRepositoryInterface;

/**
 * List Suppliers Use Case
 * 
 * Application service for listing suppliers with filters and pagination
 */
final class ListSuppliersUseCase
{
    public function __construct(
        private readonly SupplierRepositoryInterface $repository
    ) {
    }

    /**
     * @param array $filters ['active' => true, 'search' => 'term']
     * @param int $page
     * @param int $perPage
     * @return array ['data' => Supplier[], 'total' => int, 'page' => int, 'per_page' => int]
     */
    public function execute(array $filters = [], int $page = 1, int $perPage = 15): array
    {
        $result = $this->repository->findAll($filters, $page, $perPage);

        return [
            'data' => $result['data'],
            'total' => $result['total'],
            'page' => $page,
            'per_page' => $perPage,
            'last_page' => ceil($result['total'] / $perPage),
        ];
    }
}
