<?php

declare(strict_types=1);

namespace Infrastructure\Repositories;

use Domain\Entities\Product;
use Domain\Repositories\ProductRepositoryInterface;
use Domain\ValueObjects\Unit;
use Infrastructure\Persistence\Eloquent\ProductModel;

/**
 * Eloquent-based Product Repository Implementation
 */
class ProductRepository implements ProductRepositoryInterface
{
    private function toDomainEntity(ProductModel $model): Product
    {
        $unit = new Unit($model->default_unit);

        return Product::create(
            id: $model->id,
            name: $model->name,
            description: $model->description ?? '',
            defaultUnit: $unit,
            metadata: $model->metadata ?? []
        );
    }

    private function toModelData(Product $product): array
    {
        return [
            'id' => $product->id(),
            'name' => $product->name(),
            'description' => $product->description(),
            'default_unit' => $product->defaultUnit()->symbol(),
            'metadata' => $product->metadata(),
            'is_active' => $product->isActive(),
        ];
    }

    public function findById(string $id): ?Product
    {
        $model = ProductModel::find($id);
        
        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findAll(int $page = 1, int $perPage = 20, array $filters = []): array
    {
        $query = ProductModel::query();

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (isset($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                  ->orWhere('description', 'like', "%{$filters['search']}%");
            });
        }

        $models = $query->orderBy('created_at', 'desc')
                       ->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => $models->map(fn($model) => $this->toDomainEntity($model))->all(),
            'total' => $models->total(),
            'page' => $models->currentPage(),
            'per_page' => $models->perPage(),
            'last_page' => $models->lastPage(),
        ];
    }

    public function findActive(): array
    {
        $models = ProductModel::where('is_active', true)
                              ->orderBy('name')
                              ->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->all();
    }

    public function save(Product $product): Product
    {
        $data = $this->toModelData($product);
        
        ProductModel::updateOrCreate(
            ['id' => $product->id()],
            $data
        );

        return $product;
    }

    public function delete(string $id): bool
    {
        $model = ProductModel::find($id);
        
        if (!$model) {
            return false;
        }

        return $model->delete();
    }

    public function exists(string $id): bool
    {
        return ProductModel::where('id', $id)->exists();
    }
}
