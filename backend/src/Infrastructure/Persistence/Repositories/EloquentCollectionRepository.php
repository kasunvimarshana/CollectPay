<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Repositories;

use Domain\Entities\Collection;
use Domain\Repositories\CollectionRepositoryInterface;
use Domain\ValueObjects\Quantity;
use Domain\ValueObjects\Unit;
use Domain\ValueObjects\Money;
use Infrastructure\Persistence\Eloquent\Models\CollectionModel;
use DateTimeImmutable;

/**
 * Eloquent Collection Repository Implementation
 */
final class EloquentCollectionRepository implements CollectionRepositoryInterface
{
    public function save(Collection $collection): void
    {
        $model = CollectionModel::find($collection->getId()) ?? new CollectionModel();

        $model->fill([
            'id' => $collection->getId(),
            'supplier_id' => $collection->getSupplierId(),
            'product_id' => $collection->getProductId(),
            'rate_id' => $collection->getRateId(),
            'quantity_value' => $collection->getQuantity()->getValue(),
            'quantity_unit' => $collection->getQuantity()->getUnit()->toString(),
            'total_amount' => $collection->getTotalAmount()->getAmount(),
            'total_amount_currency' => $collection->getTotalAmount()->getCurrency(),
            'collection_date' => $collection->getCollectionDate()->format('Y-m-d H:i:s'),
            'collected_by' => $collection->getCollectedBy(),
            'notes' => $collection->getNotes(),
        ]);

        if (!$model->exists) {
            $model->created_at = $collection->getCreatedAt()->format('Y-m-d H:i:s');
        }
        $model->updated_at = $collection->getUpdatedAt()->format('Y-m-d H:i:s');

        $model->save();
    }

    public function findById(string $id): ?Collection
    {
        $model = CollectionModel::find($id);

        if (!$model) {
            return null;
        }

        return $this->toDomainEntity($model);
    }

    public function findBySupplierId(
        string $supplierId,
        int $page = 1,
        int $perPage = 20
    ): array {
        $models = CollectionModel::where('supplier_id', $supplierId)
            ->orderBy('collection_date', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->toArray();
    }

    public function findBySupplierAndDateRange(
        string $supplierId,
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate
    ): array {
        $models = CollectionModel::where('supplier_id', $supplierId)
            ->whereBetween('collection_date', [
                $startDate->format('Y-m-d H:i:s'),
                $endDate->format('Y-m-d H:i:s')
            ])
            ->orderBy('collection_date', 'desc')
            ->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->toArray();
    }

    public function findAll(int $page = 1, int $perPage = 20): array
    {
        $models = CollectionModel::orderBy('collection_date', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->toArray();
    }

    public function delete(string $id): void
    {
        $model = CollectionModel::find($id);
        if ($model) {
            $model->delete();
        }
    }

    private function toDomainEntity(CollectionModel $model): Collection
    {
        return Collection::reconstitute(
            $model->id,
            $model->supplier_id,
            $model->product_id,
            $model->rate_id,
            Quantity::create(
                (float) $model->quantity_value,
                Unit::fromString($model->quantity_unit)
            ),
            Money::fromFloat(
                (float) $model->total_amount,
                $model->total_amount_currency
            ),
            new DateTimeImmutable($model->collection_date),
            $model->collected_by,
            $model->notes,
            new DateTimeImmutable($model->created_at),
            new DateTimeImmutable($model->updated_at),
            $model->deleted_at ? new DateTimeImmutable($model->deleted_at) : null
        );
    }
}
