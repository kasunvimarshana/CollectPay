<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Repositories;

use Domain\Entities\Product;
use Domain\Repositories\ProductRepositoryInterface;
use Domain\ValueObjects\UUID;
use Infrastructure\Persistence\Eloquent\ProductModel;
use DateTimeImmutable;

/**
 * Eloquent Product Repository Implementation
 * 
 * Infrastructure layer - implements domain repository interface
 */
final class EloquentProductRepository implements ProductRepositoryInterface
{
    public function save(Product $product): void
    {
        ProductModel::updateOrCreate(
            ['id' => $product->id()->value()],
            [
                'name' => $product->name(),
                'code' => $product->code(),
                'unit' => $product->unit(),
                'description' => $product->description(),
                'active' => $product->isActive(),
                'version' => $product->version(),
                'updated_at' => $product->updatedAt(),
            ]
        );
    }

    public function findById(UUID $id): ?Product
    {
        $model = ProductModel::find($id->value());
        
        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findByCode(string $code): ?Product
    {
        $model = ProductModel::where('code', strtoupper(trim($code)))->first();
        
        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findAll(int $page = 1, int $perPage = 30, ?string $search = null): array
    {
        $query = ProductModel::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $models = $query->orderBy('name')
                        ->skip(($page - 1) * $perPage)
                        ->take($perPage)
                        ->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->all();
    }

    public function count(?string $search = null): int
    {
        $query = ProductModel::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        return $query->count();
    }

    public function delete(UUID $id): void
    {
        ProductModel::where('id', $id->value())->delete();
    }

    public function codeExists(string $code, ?UUID $excludeId = null): bool
    {
        $query = ProductModel::where('code', strtoupper(trim($code)));

        if ($excludeId) {
            $query->where('id', '!=', $excludeId->value());
        }

        return $query->exists();
    }

    private function toDomainEntity(ProductModel $model): Product
    {
        return Product::reconstitute(
            $model->id,
            $model->name,
            $model->code,
            $model->unit,
            $model->description,
            $model->active,
            new DateTimeImmutable($model->created_at),
            new DateTimeImmutable($model->updated_at),
            $model->version
        );
    }
}
