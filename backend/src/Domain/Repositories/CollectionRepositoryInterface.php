<?php

declare(strict_types=1);

namespace Domain\Repositories;

use Domain\Entities\Collection;
use Domain\ValueObjects\UUID;
use DateTimeImmutable;

interface CollectionRepositoryInterface
{
    public function save(Collection $collection): void;
    
    public function findById(UUID $id): ?Collection;
    
    /**
     * @return Collection[]
     */
    public function findBySupplierId(UUID $supplierId, ?DateTimeImmutable $from = null, ?DateTimeImmutable $to = null): array;
    
    /**
     * @return Collection[]
     */
    public function findAll(int $page = 1, int $perPage = 30, ?array $filters = null): array;
    
    public function count(?array $filters = null): int;
    
    public function delete(UUID $id): void;
}
