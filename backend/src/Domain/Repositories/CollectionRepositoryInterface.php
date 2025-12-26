<?php

namespace Src\Domain\Repositories;

use Src\Domain\Entities\Collection;

interface CollectionRepositoryInterface
{
    public function findById(int $id): ?Collection;
    public function findByUuid(string $uuid): ?Collection;
    public function findAll(array $filters = []): array;
    public function create(array $data): Collection;
    public function update(string $uuid, array $data): Collection;
    public function delete(string $uuid): bool;
    public function findByUserId(int $userId): array;
    public function findForSync(string $deviceId, ?string $lastSyncedAt): array;
}
