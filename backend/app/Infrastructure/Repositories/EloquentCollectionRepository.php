<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Entities\CollectionEntity;
use App\Domain\Repositories\CollectionRepositoryInterface;
use App\Domain\Exceptions\EntityNotFoundException;
use App\Domain\Exceptions\VersionConflictException;
use App\Models\Collection;

/**
 * Eloquent Collection Repository
 * 
 * Infrastructure implementation of CollectionRepositoryInterface using Eloquent ORM.
 * Converts between Eloquent models and domain entities.
 */
class EloquentCollectionRepository implements CollectionRepositoryInterface
{
    public function findById(int $id): ?CollectionEntity
    {
        $model = Collection::find($id);
        
        return $model ? $this->toEntity($model) : null;
    }

    public function findAll(array $filters = [], int $page = 1, int $perPage = 15): array
    {
        $query = Collection::query();

        // Apply filters
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

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'collection_date';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $models = $query->skip(($page - 1) * $perPage)
                        ->take($perPage)
                        ->get();

        return $models->map(fn($model) => $this->toEntity($model))->all();
    }

    public function count(array $filters = []): int
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

        return $query->count();
    }

    public function save(CollectionEntity $collection): CollectionEntity
    {
        $model = new Collection();
        $this->fillModel($model, $collection);
        $model->save();

        return $this->toEntity($model->fresh());
    }

    public function update(CollectionEntity $collection): CollectionEntity
    {
        $model = Collection::find($collection->getId());

        if (!$model) {
            throw new EntityNotFoundException("Collection not found with ID: {$collection->getId()}");
        }

        // Version conflict check
        if ($model->version != $collection->getVersion()) {
            throw new VersionConflictException(
                "Version mismatch. Expected: {$model->version}, Got: {$collection->getVersion()}"
            );
        }

        $this->fillModel($model, $collection);
        $model->version = $collection->getVersion() + 1;
        $model->save();

        return $this->toEntity($model->fresh());
    }

    public function delete(int $id): bool
    {
        $model = Collection::find($id);
        
        if (!$model) {
            return false;
        }

        return $model->delete();
    }

    /**
     * Convert Eloquent model to domain entity
     */
    private function toEntity(Collection $model): CollectionEntity
    {
        return new CollectionEntity(
            supplierId: $model->supplier_id,
            productId: $model->product_id,
            userId: $model->user_id,
            collectionDate: new \DateTimeImmutable($model->collection_date),
            quantity: (float) $model->quantity,
            unit: $model->unit,
            rateApplied: (float) $model->rate_applied,
            productRateId: $model->product_rate_id,
            notes: $model->notes,
            metadata: $model->metadata,
            version: $model->version,
            id: $model->id
        );
    }

    /**
     * Fill Eloquent model from domain entity
     */
    private function fillModel(Collection $model, CollectionEntity $entity): void
    {
        $model->supplier_id = $entity->getSupplierId();
        $model->product_id = $entity->getProductId();
        $model->user_id = $entity->getUserId();
        $model->product_rate_id = $entity->getProductRateId();
        $model->collection_date = $entity->getCollectionDate()->format('Y-m-d');
        $model->quantity = $entity->getQuantity();
        $model->unit = $entity->getUnit();
        $model->rate_applied = $entity->getRateApplied();
        $model->total_amount = $entity->getTotalAmount();
        $model->notes = $entity->getNotes();
        $model->metadata = $entity->getMetadata();
    }
}
