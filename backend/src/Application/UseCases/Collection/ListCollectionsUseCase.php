<?php

declare(strict_types=1);

namespace Application\UseCases\Collection;

use Domain\Repositories\CollectionRepositoryInterface;

/**
 * List Collections Use Case
 */
final class ListCollectionsUseCase
{
    public function __construct(
        private readonly CollectionRepositoryInterface $collectionRepository
    ) {}

    public function execute(int $page = 1, int $perPage = 20): array
    {
        return $this->collectionRepository->findAll($page, $perPage);
    }

    public function executeBySupplier(string $supplierId, int $page = 1, int $perPage = 20): array
    {
        return $this->collectionRepository->findBySupplierId($supplierId, $page, $perPage);
    }
}
