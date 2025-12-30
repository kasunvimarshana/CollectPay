<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Entities\CollectionEntity;
use App\Domain\Repositories\CollectionRepositoryInterface;
use App\Models\Collection;

/**
 * Eloquent Collection Repository
 *
 * Infrastructure implementation of the CollectionRepositoryInterface.
 * Bridges the domain layer with Laravel's Eloquent ORM.
 */
class EloquentCollectionRepository implements CollectionRepositoryInterface
{
    /**
     * Convert Eloquent model to Domain entity
     */
    private function toDomainEntity(Collection $model): CollectionEntity
    {
        return new CollectionEntity(
            supplierId: $model->supplier_id,
            productId: $model->product_id,
            collectedBy: $model->collected_by,
            quantity: (float) $model->quantity,
            unit: $model->unit,
            rate: (float) $model->rate,
            collectionDate: new \DateTime($model->collection_date),
            rateId: $model->rate_id,
            collectionTime: $model->collection_time,
            notes: $model->notes,
            metadata: $model->metadata ?? [],
            version: $model->version ?? 1,
            id: $model->id,
            createdAt: $model->created_at,
            updatedAt: $model->updated_at
        );
    }

    /**
     * Convert Domain entity to Eloquent model attributes
     */
    private function toModelAttributes(CollectionEntity $entity): array
    {
        return [
            'supplier_id' => $entity->getSupplierId(),
            'product_id' => $entity->getProductId(),
            'collected_by' => $entity->getCollectedBy(),
            'quantity' => $entity->getQuantity(),
            'unit' => $entity->getUnit(),
            'rate' => $entity->getRate(),
            'rate_id' => $entity->getRateId(),
            'total_amount' => $entity->getTotalAmount(),
            'collection_date' => $entity->getCollectionDate()->format('Y-m-d'),
            'collection_time' => $entity->getCollectionTime(),
            'notes' => $entity->getNotes(),
            'metadata' => $entity->getMetadata(),
            'version' => $entity->getVersion(),
        ];
    }

    public function save(CollectionEntity $entity): CollectionEntity
    {
        $attributes = $this->toModelAttributes($entity);

        if ($entity->getId() === null) {
            // Create new
            $model = Collection::create($attributes);
        } else {
            // Update existing
            $model = Collection::findOrFail($entity->getId());
            $model->update($attributes);
        }

        return $this->toDomainEntity($model);
    }

    public function findById(int $id): ?CollectionEntity
    {
        $model = Collection::find($id);

        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findBySupplier(int $supplierId, ?\DateTimeInterface $fromDate = null, ?\DateTimeInterface $toDate = null): array
    {
        $query = Collection::where('supplier_id', $supplierId);

        if ($fromDate !== null) {
            $query->where('collection_date', '>=', $fromDate->format('Y-m-d'));
        }

        if ($toDate !== null) {
            $query->where('collection_date', '<=', $toDate->format('Y-m-d'));
        }

        $models = $query->orderBy('collection_date', 'desc')->get();

        return $models->map(fn ($model) => $this->toDomainEntity($model))->all();
    }

    public function findByProduct(int $productId, ?\DateTimeInterface $fromDate = null, ?\DateTimeInterface $toDate = null): array
    {
        $query = Collection::where('product_id', $productId);

        if ($fromDate !== null) {
            $query->where('collection_date', '>=', $fromDate->format('Y-m-d'));
        }

        if ($toDate !== null) {
            $query->where('collection_date', '<=', $toDate->format('Y-m-d'));
        }

        $models = $query->orderBy('collection_date', 'desc')->get();

        return $models->map(fn ($model) => $this->toDomainEntity($model))->all();
    }

    public function findByDate(\DateTimeInterface $date): array
    {
        $dateStr = $date->format('Y-m-d');
        $models = Collection::whereDate('collection_date', $dateStr)->get();

        return $models->map(fn ($model) => $this->toDomainEntity($model))->all();
    }

    public function list(array $filters = [], int $page = 1, int $perPage = 15): array
    {
        $query = Collection::query();

        if (isset($filters['supplier_id'])) {
            $query->where('supplier_id', $filters['supplier_id']);
        }

        if (isset($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }

        if (isset($filters['from_date'])) {
            $query->where('collection_date', '>=', $filters['from_date']);
        }

        if (isset($filters['to_date'])) {
            $query->where('collection_date', '<=', $filters['to_date']);
        }

        $paginator = $query->orderBy('collection_date', 'desc')->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => $paginator->items() ? array_map(fn ($model) => $this->toDomainEntity($model), $paginator->items()) : [],
            'total' => $paginator->total(),
            'page' => $paginator->currentPage(),
            'per_page' => $paginator->perPage(),
            'last_page' => $paginator->lastPage(),
        ];
    }

    public function delete(int $id): bool
    {
        $model = Collection::findOrFail($id);

        return $model->delete();
    }

    public function exists(int $id): bool
    {
        return Collection::where('id', $id)->exists();
    }

    public function getTotalAmountBySupplier(int $supplierId, ?\DateTimeInterface $fromDate = null, ?\DateTimeInterface $toDate = null): float
    {
        $query = Collection::where('supplier_id', $supplierId);

        if ($fromDate !== null) {
            $query->where('collection_date', '>=', $fromDate->format('Y-m-d'));
        }

        if ($toDate !== null) {
            $query->where('collection_date', '<=', $toDate->format('Y-m-d'));
        }

        return (float) $query->sum('total_amount');
    }
}
