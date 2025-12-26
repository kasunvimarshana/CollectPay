<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Entities\ProductEntity;
use App\Domain\Repositories\ProductRepositoryInterface;
use App\Domain\Exceptions\EntityNotFoundException;
use App\Domain\Exceptions\VersionConflictException;
use App\Models\Product;

/**
 * Eloquent Product Repository
 * 
 * Infrastructure implementation of ProductRepositoryInterface using Eloquent ORM.
 * Converts between Eloquent models and domain entities.
 */
class EloquentProductRepository implements ProductRepositoryInterface
{
    public function findById(int $id): ?ProductEntity
    {
        $model = Product::find($id);
        
        return $model ? $this->toEntity($model) : null;
    }

    public function findAll(array $filters = [], int $page = 1, int $perPage = 15): array
    {
        $query = Product::query();

        // Apply filters
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'name';
        $sortOrder = $filters['sort_order'] ?? 'asc';
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $models = $query->skip(($page - 1) * $perPage)
                        ->take($perPage)
                        ->get();

        return $models->map(fn($model) => $this->toEntity($model))->all();
    }

    public function count(array $filters = []): int
    {
        $query = Product::query();

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        return $query->count();
    }

    public function save(ProductEntity $product): ProductEntity
    {
        $model = new Product();
        $this->fillModel($model, $product);
        $model->save();

        return $this->toEntity($model->fresh());
    }

    public function update(ProductEntity $product): ProductEntity
    {
        $model = Product::find($product->getId());

        if (!$model) {
            throw new EntityNotFoundException("Product not found with ID: {$product->getId()}");
        }

        // Version conflict check
        if ($model->version != $product->getVersion()) {
            throw new VersionConflictException(
                "Version mismatch. Expected: {$model->version}, Got: {$product->getVersion()}"
            );
        }

        $this->fillModel($model, $product);
        $model->version = $product->getVersion() + 1;
        $model->save();

        return $this->toEntity($model->fresh());
    }

    public function delete(int $id): bool
    {
        $model = Product::find($id);
        
        if (!$model) {
            return false;
        }

        return $model->delete();
    }

    public function codeExists(string $code, ?int $excludeId = null): bool
    {
        $query = Product::where('code', $code);

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    /**
     * Convert Eloquent model to domain entity
     */
    private function toEntity(Product $model): ProductEntity
    {
        return new ProductEntity(
            name: $model->name,
            code: $model->code,
            defaultUnit: $model->default_unit,
            supportedUnits: $model->supported_units ?? [$model->default_unit],
            description: $model->description,
            metadata: $model->metadata,
            isActive: $model->is_active,
            version: $model->version,
            id: $model->id
        );
    }

    /**
     * Fill Eloquent model from domain entity
     */
    private function fillModel(Product $model, ProductEntity $entity): void
    {
        $model->name = $entity->getName();
        $model->code = $entity->getCode();
        $model->description = $entity->getDescription();
        $model->default_unit = $entity->getDefaultUnit();
        $model->supported_units = $entity->getSupportedUnits();
        $model->metadata = $entity->getMetadata();
        $model->is_active = $entity->isActive();
    }
}
