<?php

declare(strict_types=1);

namespace Application\UseCases\Collection;

use Domain\Repositories\CollectionRepositoryInterface;

/**
 * Get Collection Use Case
 */
final class GetCollectionUseCase
{
    public function __construct(
        private readonly CollectionRepositoryInterface $collectionRepository
    ) {}

    public function execute(string $id): ?\Domain\Entities\Collection
    {
        return $this->collectionRepository->findById($id);
    }
}
