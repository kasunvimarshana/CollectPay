<?php

declare(strict_types=1);

namespace Application\UseCases\Collection;

use Domain\Repositories\CollectionRepositoryInterface;

/**
 * Use Case: List all collections
 */
final class ListCollectionsUseCase
{
    public function __construct(
        private readonly CollectionRepositoryInterface $collectionRepository
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
        return $this->collectionRepository->findAll($page, $perPage, $filters);
    }
}
