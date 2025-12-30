<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Entities\ProductRateEntity;
use App\Domain\Repositories\ProductRateRepositoryInterface;
use App\Models\ProductRate;

/**
 * Eloquent ProductRate Repository
 *
 * Infrastructure implementation of the ProductRateRepositoryInterface.
 * Bridges the domain layer with Laravel's Eloquent ORM.
 */
class EloquentProductRateRepository implements ProductRateRepositoryInterface
{
    /**
     * Convert Eloquent model to Domain entity
     */
    private function toDomainEntity(ProductRate $model): ProductRateEntity
    {
        return new ProductRateEntity(
            productId: $model->product_id,
            rate: (float) $model->rate,
            unit: $model->unit,
            effectiveFrom: new \DateTime($model->effective_from),
            effectiveTo: $model->effective_to ? new \DateTime($model->effective_to) : null,
            isActive: $model->is_active,
            notes: $model->notes,
            version: $model->version ?? 1,
            id: $model->id,
            createdAt: $model->created_at,
            updatedAt: $model->updated_at
        );
    }

    /**
     * Convert Domain entity to Eloquent model attributes
     */
    private function toModelAttributes(ProductRateEntity $entity): array
    {
        return [
            'product_id' => $entity->getProductId(),
            'rate' => $entity->getRate(),
            'unit' => $entity->getUnit(),
            'effective_from' => $entity->getEffectiveFrom()->format('Y-m-d'),
            'effective_to' => $entity->getEffectiveTo()?->format('Y-m-d'),
            'is_active' => $entity->isActive(),
            'notes' => $entity->getNotes(),
            'version' => $entity->getVersion(),
        ];
    }

    public function save(ProductRateEntity $entity): ProductRateEntity
    {
        $attributes = $this->toModelAttributes($entity);

        if ($entity->getId() === null) {
            // Create new
            $model = ProductRate::create($attributes);
        } else {
            // Update existing
            $model = ProductRate::findOrFail($entity->getId());
            $model->update($attributes);
        }

        return $this->toDomainEntity($model);
    }

    public function findById(int $id): ?ProductRateEntity
    {
        $model = ProductRate::find($id);

        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findByProduct(int $productId, bool $activeOnly = false): array
    {
        $query = ProductRate::where('product_id', $productId);

        if ($activeOnly) {
            $query->where('is_active', true);
        }

        $models = $query->orderBy('effective_from', 'desc')->get();

        return $models->map(fn ($model) => $this->toDomainEntity($model))->all();
    }

    public function getCurrentRate(int $productId, \DateTimeInterface $date, string $unit): ?ProductRateEntity
    {
        $dateStr = $date->format('Y-m-d');

        $model = ProductRate::where('product_id', $productId)
            ->where('unit', $unit)
            ->where('is_active', true)
            ->where('effective_from', '<=', $dateStr)
            ->where(function ($query) use ($dateStr) {
                $query->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', $dateStr);
            })
            ->orderBy('effective_from', 'desc')
            ->first();

        return $model ? $this->toDomainEntity($model) : null;
    }

    public function list(array $filters = [], int $page = 1, int $perPage = 15): array
    {
        $query = ProductRate::query();

        if (isset($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (isset($filters['unit'])) {
            $query->where('unit', $filters['unit']);
        }

        $paginator = $query->orderBy('effective_from', 'desc')->paginate($perPage, ['*'], 'page', $page);

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
        $model = ProductRate::findOrFail($id);

        return $model->delete();
    }

    public function exists(int $id): bool
    {
        return ProductRate::where('id', $id)->exists();
    }

    public function deactivateOtherRates(int $productId, int $exceptRateId): void
    {
        ProductRate::where('product_id', $productId)
            ->where('id', '!=', $exceptRateId)
            ->update(['is_active' => false]);
    }
}
