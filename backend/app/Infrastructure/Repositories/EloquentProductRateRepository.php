<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Entities\ProductRateEntity;
use App\Domain\Repositories\ProductRateRepositoryInterface;
use App\Domain\Exceptions\EntityNotFoundException;
use App\Domain\Exceptions\VersionConflictException;
use App\Models\ProductRate;

/**
 * Eloquent ProductRate Repository
 * 
 * Infrastructure implementation of ProductRateRepositoryInterface using Eloquent ORM.
 * Converts between Eloquent models and domain entities.
 */
class EloquentProductRateRepository implements ProductRateRepositoryInterface
{
    public function findById(int $id): ?ProductRateEntity
    {
        $model = ProductRate::find($id);
        
        return $model ? $this->toEntity($model) : null;
    }

    public function findAll(array $filters = [], int $page = 1, int $perPage = 15): array
    {
        $query = ProductRate::query();

        // Apply filters
        if (isset($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }

        if (isset($filters['unit'])) {
            $query->where('unit', $filters['unit']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'effective_date';
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
        $query = ProductRate::query();

        if (isset($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }

        if (isset($filters['unit'])) {
            $query->where('unit', $filters['unit']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        return $query->count();
    }

    public function save(ProductRateEntity $rate): ProductRateEntity
    {
        $model = new ProductRate();
        $this->fillModel($model, $rate);
        $model->save();

        return $this->toEntity($model->fresh());
    }

    public function update(ProductRateEntity $rate): ProductRateEntity
    {
        $model = ProductRate::find($rate->getId());

        if (!$model) {
            throw new EntityNotFoundException("ProductRate not found with ID: {$rate->getId()}");
        }

        // Version conflict check
        if ($model->version != $rate->getVersion()) {
            throw new VersionConflictException(
                "Version mismatch. Expected: {$model->version}, Got: {$rate->getVersion()}"
            );
        }

        $this->fillModel($model, $rate);
        $model->version = $rate->getVersion() + 1;
        $model->save();

        return $this->toEntity($model->fresh());
    }

    public function delete(int $id): bool
    {
        $model = ProductRate::find($id);
        
        if (!$model) {
            return false;
        }

        return $model->delete();
    }

    public function findCurrentRate(int $productId, string $unit, string $date): ?ProductRateEntity
    {
        $model = ProductRate::where('product_id', $productId)
            ->where('unit', $unit)
            ->where('effective_date', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->whereNull('end_date')
                    ->orWhere('end_date', '>=', $date);
            })
            ->where('is_active', true)
            ->orderBy('effective_date', 'desc')
            ->first();

        return $model ? $this->toEntity($model) : null;
    }

    /**
     * Convert Eloquent model to domain entity
     */
    private function toEntity(ProductRate $model): ProductRateEntity
    {
        return new ProductRateEntity(
            productId: $model->product_id,
            unit: $model->unit,
            rate: (float) $model->rate,
            effectiveDate: new \DateTimeImmutable($model->effective_date),
            endDate: $model->end_date ? new \DateTimeImmutable($model->end_date) : null,
            isActive: $model->is_active,
            metadata: $model->metadata,
            version: $model->version,
            id: $model->id
        );
    }

    /**
     * Fill Eloquent model from domain entity
     */
    private function fillModel(ProductRate $model, ProductRateEntity $entity): void
    {
        $model->product_id = $entity->getProductId();
        $model->unit = $entity->getUnit();
        $model->rate = $entity->getRate();
        $model->effective_date = $entity->getEffectiveDate()->format('Y-m-d');
        $model->end_date = $entity->getEndDate()?->format('Y-m-d');
        $model->is_active = $entity->isActive();
        $model->metadata = $entity->getMetadata();
    }
}
