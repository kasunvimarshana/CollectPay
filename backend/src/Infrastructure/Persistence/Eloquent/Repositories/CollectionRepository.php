<?php

namespace Infrastructure\Persistence\Eloquent\Repositories;

use Domain\Collection\Collection;
use Domain\Collection\CollectionRepositoryInterface;
use Domain\Collection\CollectionStatus;
use Domain\Collection\ProductType;
use Domain\Collection\Quantity;
use Domain\Shared\ValueObjects\Money;
use Domain\Shared\ValueObjects\Uuid;
use Infrastructure\Persistence\Eloquent\Models\CollectionModel;
use DateTimeImmutable;

class CollectionRepository implements CollectionRepositoryInterface
{
    public function save(Collection $collection): void
    {
        $model = CollectionModel::findOrNew($collection->id()->value());
        
        $model->id = $collection->id()->value();
        $model->supplier_id = $collection->supplierId()->value();
        $model->collected_by = $collection->collectedBy()->value();
        $model->product_type = $collection->productType()->name();
        $model->quantity_value = $collection->quantity()->value();
        $model->quantity_unit = $collection->quantity()->unit();
        $model->rate_per_unit = $collection->ratePerUnit()->amount();
        $model->rate_currency = $collection->ratePerUnit()->currency();
        $model->total_amount = $collection->totalAmount()->amount();
        $model->total_currency = $collection->totalAmount()->currency();
        $model->notes = $collection->notes();
        $model->status = $collection->status()->value();
        $model->collection_date = $collection->collectionDate();
        $model->sync_id = $collection->syncId();
        
        $model->save();
    }

    public function findById(string $id): ?Collection
    {
        $model = CollectionModel::find($id);
        
        return $model ? $this->toDomain($model) : null;
    }

    public function findBySupplierId(string $supplierId, int $page = 1, int $perPage = 20): array
    {
        $models = CollectionModel::where('supplier_id', $supplierId)
            ->orderBy('collection_date', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();
        
        return $models->map(fn($model) => $this->toDomain($model))->all();
    }

    public function findByCollectedBy(string $userId, int $page = 1, int $perPage = 20): array
    {
        $models = CollectionModel::where('collected_by', $userId)
            ->orderBy('collection_date', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();
        
        return $models->map(fn($model) => $this->toDomain($model))->all();
    }

    public function findByStatus(string $status, int $page = 1, int $perPage = 20): array
    {
        $models = CollectionModel::where('status', $status)
            ->orderBy('collection_date', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();
        
        return $models->map(fn($model) => $this->toDomain($model))->all();
    }

    public function findByDateRange(DateTimeImmutable $from, DateTimeImmutable $to): array
    {
        $models = CollectionModel::whereBetween('collection_date', [$from, $to])
            ->orderBy('collection_date', 'desc')
            ->get();
        
        return $models->map(fn($model) => $this->toDomain($model))->all();
    }

    public function findBySyncId(string $syncId): ?Collection
    {
        $model = CollectionModel::where('sync_id', $syncId)->first();
        
        return $model ? $this->toDomain($model) : null;
    }

    public function delete(string $id): void
    {
        CollectionModel::where('id', $id)->delete();
    }

    public function getTotalAmountBySupplier(string $supplierId): int
    {
        return CollectionModel::where('supplier_id', $supplierId)
            ->where('status', 'approved')
            ->sum('total_amount');
    }

    public function getStatsByCollector(string $userId): array
    {
        $stats = CollectionModel::where('collected_by', $userId)
            ->selectRaw('status, COUNT(*) as count, SUM(total_amount) as total')
            ->groupBy('status')
            ->get();
        
        return $stats->mapWithKeys(function ($stat) {
            return [$stat->status => [
                'count' => $stat->count,
                'total' => $stat->total,
            ]];
        })->all();
    }

    private function toDomain(CollectionModel $model): Collection
    {
        return Collection::reconstitute(
            Uuid::fromString($model->id),
            Uuid::fromString($model->supplier_id),
            Uuid::fromString($model->collected_by),
            ProductType::fromString($model->product_type),
            Quantity::fromValue((float) $model->quantity_value, $model->quantity_unit),
            Money::fromCents($model->rate_per_unit, $model->rate_currency),
            Money::fromCents($model->total_amount, $model->total_currency),
            $model->notes,
            CollectionStatus::fromString($model->status),
            $model->collection_date->toDateTimeImmutable(),
            $model->created_at->toDateTimeImmutable(),
            $model->updated_at->toDateTimeImmutable(),
            $model->sync_id
        );
    }
}
