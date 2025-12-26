<?php

namespace App\Repositories;

use App\Models\Rate as RateModel;
use Src\Domain\Entities\Rate;
use Src\Domain\Repositories\RateRepositoryInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class RateRepository implements RateRepositoryInterface
{
    public function findById(int $id): ?Rate
    {
        $model = RateModel::find($id);
        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findByUuid(string $uuid): ?Rate
    {
        $model = RateModel::where('uuid', $uuid)->first();
        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findAll(array $filters = []): array
    {
        $query = RateModel::query();

        if (isset($filters['is_active'])) {
            if ($filters['is_active']) {
                $query->active();
            } else {
                $query->where('is_active', false);
            }
        }

        if (isset($filters['collection_id'])) {
            $query->where('collection_id', $filters['collection_id']);
        }

        if (isset($filters['synced_at'])) {
            $query->where('synced_at', '>=', $filters['synced_at']);
        }

        return $query->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($model) => $this->toDomainEntity($model))
            ->toArray();
    }

    public function create(array $data): Rate
    {
        // Ensure version starts at 1
        $data['version'] = 1;
        $model = RateModel::create($data);
        return $this->toDomainEntity($model);
    }

    public function update(string $uuid, array $data): Rate
    {
        $model = RateModel::where('uuid', $uuid)->firstOrFail();

        // Create a new version instead of updating
        $latestVersion = RateModel::where('name', $model->name)
            ->max('version');

        $data['version'] = ($latestVersion ?? 0) + 1;
        $data['uuid'] = \Illuminate\Support\Str::uuid();

        $newModel = RateModel::create($data);
        return $this->toDomainEntity($newModel);
    }

    public function delete(string $uuid): bool
    {
        $model = RateModel::where('uuid', $uuid)->firstOrFail();
        return (bool) $model->delete();
    }

    public function findActiveRates(): array
    {
        return RateModel::active()
            ->orderBy('effective_from', 'desc')
            ->get()
            ->map(fn($model) => $this->toDomainEntity($model))
            ->toArray();
    }

    public function findCurrentVersionByName(string $name): ?Rate
    {
        $model = RateModel::where('name', $name)
            ->orderBy('version', 'desc')
            ->first();

        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findVersionsByName(string $name): array
    {
        return RateModel::where('name', $name)
            ->orderBy('version', 'desc')
            ->get()
            ->map(fn($model) => $this->toDomainEntity($model))
            ->toArray();
    }

    public function findForCollection(int $collectionId): array
    {
        return RateModel::where('collection_id', $collectionId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($model) => $this->toDomainEntity($model))
            ->toArray();
    }

    public function findForSync(string $deviceId, ?string $lastSyncedAt): array
    {
        $query = RateModel::query();

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

    private function toDomainEntity(RateModel $model): Rate
    {
        return new Rate(
            $model->id,
            $model->uuid,
            $model->name,
            $model->description,
            $model->amount,
            $model->currency,
            $model->rate_type,
            $model->collection_id,
            $model->version,
            $model->effective_from->toDateTimeString(),
            $model->effective_until?->toDateTimeString(),
            $model->is_active,
            $model->metadata,
            $model->created_by,
            $model->updated_by,
            $model->synced_at?->toDateTimeString(),
            $model->device_id,
            $model->created_at?->toDateTimeString(),
            $model->updated_at?->toDateTimeString(),
            $model->deleted_at?->toDateTimeString(),
        );
    }
}
