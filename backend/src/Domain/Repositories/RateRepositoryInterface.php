<?php

namespace Src\Domain\Repositories;

use Src\Domain\Entities\Rate;

interface RateRepositoryInterface
{
    public function findById(int $id): ?Rate;
    public function findByUuid(string $uuid): ?Rate;
    public function findAll(array $filters = []): array;
    public function findActive(): array;
    public function findByVersion(string $uuid, int $version): ?Rate;
    public function create(array $data): Rate;
    public function update(string $uuid, array $data): Rate;
    public function delete(string $uuid): bool;
    public function findForSync(string $deviceId, ?string $lastSyncedAt): array;
}
