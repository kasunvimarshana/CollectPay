<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Repositories;

use Domain\Entities\Collection;
use Domain\Repositories\CollectionRepositoryInterface;
use Domain\ValueObjects\UUID;
use Domain\ValueObjects\Quantity;
use Domain\ValueObjects\Money;
use Infrastructure\Persistence\Eloquent\CollectionModel;
use DateTimeImmutable;

final class EloquentCollectionRepository implements CollectionRepositoryInterface
{
    public function save(Collection $collection): void
    {
        CollectionModel::updateOrCreate(
            ['id' => $collection->id()->value()],
            [
                'supplier_id' => $collection->supplierId()->value(),
                'product_id' => $collection->productId()->value(),
                'quantity_amount' => $collection->quantity()->amount(),
                'quantity_unit' => $collection->quantity()->unit(),
                'applied_rate_amount' => $collection->appliedRate()->amount(),
                'currency' => $collection->appliedRate()->currency(),
                'total_amount' => $collection->totalAmount()->amount(),
                'collection_date' => $collection->collectionDate(),
                'notes' => $collection->notes(),
                'version' => $collection->version(),
                'updated_at' => $collection->updatedAt(),
            ]
        );
    }

    public function findById(UUID $id): ?Collection
    {
        $model = CollectionModel::find($id->value());
        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findBySupplierId(UUID $supplierId, ?DateTimeImmutable $from = null, ?DateTimeImmutable $to = null): array
    {
        $query = CollectionModel::where('supplier_id', $supplierId->value());

        if ($from) {
            $query->where('collection_date', '>=', $from);
        }

        if ($to) {
            $query->where('collection_date', '<=', $to);
        }

        $models = $query->orderBy('collection_date', 'desc')->get();
        return $models->map(fn($model) => $this->toDomainEntity($model))->all();
    }

    public function findAll(int $page = 1, int $perPage = 30, ?array $filters = null): array
    {
        $query = CollectionModel::query();

        if ($filters) {
            if (isset($filters['supplier_id'])) {
                $query->where('supplier_id', $filters['supplier_id']);
            }
            if (isset($filters['product_id'])) {
                $query->where('product_id', $filters['product_id']);
            }
            if (isset($filters['from'])) {
                $query->where('collection_date', '>=', $filters['from']);
            }
            if (isset($filters['to'])) {
                $query->where('collection_date', '<=', $filters['to']);
            }
        }

        $models = $query->orderBy('collection_date', 'desc')
                        ->skip(($page - 1) * $perPage)
                        ->take($perPage)
                        ->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->all();
    }

    public function count(?array $filters = null): int
    {
        $query = CollectionModel::query();

        if ($filters) {
            if (isset($filters['supplier_id'])) {
                $query->where('supplier_id', $filters['supplier_id']);
            }
            if (isset($filters['product_id'])) {
                $query->where('product_id', $filters['product_id']);
            }
            if (isset($filters['from'])) {
                $query->where('collection_date', '>=', $filters['from']);
            }
            if (isset($filters['to'])) {
                $query->where('collection_date', '<=', $filters['to']);
            }
        }

        return $query->count();
    }

    public function delete(UUID $id): void
    {
        CollectionModel::where('id', $id->value())->delete();
    }

    private function toDomainEntity(CollectionModel $model): Collection
    {
        return Collection::reconstitute(
            $model->id,
            $model->supplier_id,
            $model->product_id,
            (float) $model->quantity_amount,
            $model->quantity_unit,
            (float) $model->applied_rate_amount,
            $model->currency,
            new DateTimeImmutable($model->collection_date),
            $model->notes,
            new DateTimeImmutable($model->created_at),
            new DateTimeImmutable($model->updated_at),
            $model->version
        );
    }
}
