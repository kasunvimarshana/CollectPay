<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Entities\ProductEntity;
use App\Domain\Repositories\ProductRepositoryInterface;
use App\Models\Product;

/**
 * Eloquent Product Repository
 *
 * Infrastructure implementation of the ProductRepositoryInterface.
 * Bridges the domain layer with Laravel's Eloquent ORM.
 */
class EloquentProductRepository implements ProductRepositoryInterface
{
    /**
     * Convert Eloquent model to Domain entity
     */
    private function toDomainEntity(Product $model): ProductEntity
    {
        return new ProductEntity(
            name: $model->name,
            code: $model->code,
            baseUnit: $model->base_unit,
            description: $model->description,
            allowedUnits: $model->allowed_units ?? [$model->base_unit],
            status: $model->status,
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
    private function toModelAttributes(ProductEntity $entity): array
    {
        return [
            'name' => $entity->getName(),
            'code' => $entity->getCode(),
            'description' => $entity->getDescription(),
            'base_unit' => $entity->getBaseUnit(),
            'allowed_units' => $entity->getAllowedUnits(),
            'status' => $entity->getStatus(),
            'metadata' => $entity->getMetadata(),
            'version' => $entity->getVersion(),
        ];
    }

    public function save(ProductEntity $entity): ProductEntity
    {
        $attributes = $this->toModelAttributes($entity);

        if ($entity->getId() === null) {
            // Create new
            $model = Product::create($attributes);
        } else {
            // Update existing
            $model = Product::findOrFail($entity->getId());
            $model->update($attributes);
        }

        return $this->toDomainEntity($model);
    }

    public function findById(int $id): ?ProductEntity
    {
        $model = Product::find($id);

        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findByCode(string $code): ?ProductEntity
    {
        $model = Product::where('code', $code)->first();

        return $model ? $this->toDomainEntity($model) : null;
    }

    public function list(array $filters = [], int $page = 1, int $perPage = 15): array
    {
        $query = Product::query();

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (isset($filters['base_unit'])) {
            $query->where('base_unit', $filters['base_unit']);
        }

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

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
        $model = Product::findOrFail($id);

        return $model->delete();
    }

    public function isCodeUnique(string $code, ?int $excludeId = null): bool
    {
        $query = Product::where('code', $code);

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        return ! $query->exists();
    }

    public function exists(int $id): bool
    {
        return Product::where('id', $id)->exists();
    }

    public function getActive(): array
    {
        $models = Product::where('status', 'active')->get();

        return $models->map(fn ($model) => $this->toDomainEntity($model))->all();
    }
}
