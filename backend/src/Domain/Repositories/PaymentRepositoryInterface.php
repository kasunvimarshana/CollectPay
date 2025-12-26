<?php

namespace Src\Domain\Repositories;

use Src\Domain\Entities\Payment;

interface PaymentRepositoryInterface
{
    public function findById(int $id): ?Payment;
    public function findByUuid(string $uuid): ?Payment;
    public function findByIdempotencyKey(string $key): ?Payment;
    public function findAll(array $filters = []): array;
    public function create(array $data): Payment;
    public function update(string $uuid, array $data): Payment;
    public function delete(string $uuid): bool;
    public function findByCollectionId(int $collectionId): array;
    public function findForSync(string $deviceId, ?string $lastSyncedAt): array;
}
