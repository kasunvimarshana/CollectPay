<?php

namespace App\Repositories;

use App\Models\Collection as CollectionModel;
use Src\Domain\Entities\Collection;
use Src\Domain\Repositories\CollectionRepositoryInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class CollectionRepository implements CollectionRepositoryInterface
{
    public function findById(int $id): ?Collection
    {
        $model = CollectionModel::find($id);
        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findByUuid(string $uuid): ?Collection
    {
        $model = CollectionModel::where('uuid', $uuid)->first();
        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findAll(array $filters = []): array
    {
        $query = CollectionModel::query();

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['created_by'])) {
            $query->where('created_by', $filters['created_by']);
        }

        if (isset($filters['synced_at'])) {
            $query->where('synced_at', '>=', $filters['synced_at']);
        }

        return $query->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($model) => $this->toDomainEntity($model))
            ->toArray();
    }

    public function create(array $data): Collection
    {
        $model = CollectionModel::create($data);
        return $this->toDomainEntity($model);
    }

    public function update(string $uuid, array $data): Collection
    {
        $model = CollectionModel::where('uuid', $uuid)
            ->firstOrFail();

        // Increment version for conflict detection
        $data['version'] = ($model->version ?? 0) + 1;

        $model->update($data);
        return $this->toDomainEntity($model);
    }

    public function delete(string $uuid): bool
    {
        $model = CollectionModel::where('uuid', $uuid)
            ->firstOrFail();
        return (bool) $model->delete();
    }

    public function findByUserId(int $userId): array
    {
        return CollectionModel::where('created_by', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($model) => $this->toDomainEntity($model))
            ->toArray();
    }

    public function findForSync(string $deviceId, ?string $lastSyncedAt): array
    {
        $query = CollectionModel::query();

        if ($lastSyncedAt) {
            $query->where('updated_at', '>=', $lastSyncedAt);
        }

        if ($deviceId !== 'server') {
            $query->where(function ($q) use ($deviceId) {
                $q->where('device_id', $deviceId)
                  ->orWhereNull('device_id');
            });
        }

        return $query->orderBy('updated_at', 'desc')
            ->get()
            ->map(fn($model) => $this->toDomainEntity($model))
            ->toArray();
    }

    private function toDomainEntity(CollectionModel $model): Collection
    {
        return new Collection(
            $model->id,
            $model->uuid,
            $model->name,
            $model->description,
            $model->created_by,
            $model->updated_by,
            $model->status,
            $model->metadata,
            $model->version,
            $model->synced_at?->toDateTimeString(),
            $model->device_id,
            $model->created_at?->toDateTimeString(),
            $model->updated_at?->toDateTimeString(),
            $model->deleted_at?->toDateTimeString(),
        );
    }
}
