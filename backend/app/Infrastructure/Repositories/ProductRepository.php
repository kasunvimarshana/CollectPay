<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Entities\Product as ProductEntity;
use App\Domain\Repositories\ProductRepositoryInterface;
use App\Models\Product as ProductModel;
use DateTime;

/**
 * Product Repository Implementation using Eloquent
 */
class ProductRepository implements ProductRepositoryInterface
{
    public function __construct(
        private ProductModel $model
    ) {}

    public function findById(int $id): ?ProductEntity
    {
        $product = $this->model->find($id);
        
        if (!$product) {
            return null;
        }
        
        return $this->toEntity($product);
    }

    public function findByCode(string $code): ?ProductEntity
    {
        $product = $this->model->where('code', $code)->first();
        
        if (!$product) {
            return null;
        }
        
        return $this->toEntity($product);
    }

    public function findAll(array $filters = [], int $page = 1, int $perPage = 50): array
    {
        $query = $this->model->newQuery();
        
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }
        
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        $products = $query->orderBy('name')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();
        
        return $products->map(fn($product) => $this->toEntity($product))->toArray();
    }

    public function save(ProductEntity $product): ProductEntity
    {
        $model = $this->model->newInstance();
        $model->fill($this->toArray($product));
        $model->save();
        
        return $this->toEntity($model);
    }

    public function update(ProductEntity $product): ProductEntity
    {
        $model = $this->model->findOrFail($product->getId());
        $model->fill($this->toArray($product));
        $model->save();
        
        return $this->toEntity($model);
    }

    public function delete(int $id): bool
    {
        return $this->model->where('id', $id)->delete() > 0;
    }

    public function codeExists(string $code, ?int $excludeId = null): bool
    {
        $query = $this->model->where('code', $code);
        
        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }
        
        return $query->exists();
    }

    public function count(array $filters = []): int
    {
        $query = $this->model->newQuery();
        
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }
        
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        return $query->count();
    }

    private function toEntity(ProductModel $model): ProductEntity
    {
        return new ProductEntity(
            name: $model->name,
            code: $model->code,
            unit: $model->unit,
            description: $model->description,
            isActive: $model->is_active,
            id: $model->id,
            createdAt: $model->created_at ? new DateTime($model->created_at) : null,
            updatedAt: $model->updated_at ? new DateTime($model->updated_at) : null,
            createdBy: $model->created_by
        );
    }

    private function toArray(ProductEntity $entity): array
    {
        return [
            'name' => $entity->getName(),
            'code' => $entity->getCode(),
            'unit' => $entity->getUnit(),
            'description' => $entity->getDescription(),
            'is_active' => $entity->isActive(),
            'created_by' => $entity->getCreatedBy(),
        ];
    }
}
