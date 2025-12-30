<?php

declare(strict_types=1);

namespace Infrastructure\Repositories;

use Domain\Entities\Collection;
use Domain\Repositories\CollectionRepositoryInterface;
use Domain\ValueObjects\Quantity;
use Domain\ValueObjects\Unit;
use Domain\ValueObjects\Rate;
use Domain\ValueObjects\Money;
use Infrastructure\Persistence\Eloquent\CollectionModel;
use DateTimeImmutable;

/**
 * Eloquent-based Collection Repository Implementation
 */
class CollectionRepository implements CollectionRepositoryInterface
{
    private function toDomainEntity(CollectionModel $model): Collection
    {
        $unit = new Unit($model->quantity_unit);
        $quantity = new Quantity($model->quantity_value, $unit);
        
        $money = new Money($model->rate_price, $model->rate_currency);
        $rate = new Rate($money, new DateTimeImmutable($model->rate_effective_from));

        return Collection::create(
            id: $model->id,
            supplierId: $model->supplier_id,
            productId: $model->product_id,
            userId: $model->user_id,
            quantity: $quantity,
            appliedRate: $rate,
            collectionDate: new DateTimeImmutable($model->collection_date),
            notes: $model->notes,
            metadata: $model->metadata ?? []
        );
    }

    private function toModelData(Collection $collection): array
    {
        return [
            'id' => $collection->id(),
            'supplier_id' => $collection->supplierId(),
            'product_id' => $collection->productId(),
            'user_id' => $collection->userId(),
            'quantity_value' => $collection->quantity()->value(),
            'quantity_unit' => $collection->quantity()->unit()->symbol(),
            'rate_price' => $collection->appliedRate()->pricePerUnit()->amount(),
            'rate_currency' => $collection->appliedRate()->pricePerUnit()->currency(),
            'rate_effective_from' => $collection->appliedRate()->effectiveDate()->format('Y-m-d H:i:s'),
            'total_amount' => $collection->totalAmount()->amount(),
            'total_currency' => $collection->totalAmount()->currency(),
            'collection_date' => $collection->collectionDate()->format('Y-m-d H:i:s'),
            'notes' => $collection->notes(),
            'metadata' => $collection->metadata(),
        ];
    }

    public function findById(string $id): ?Collection
    {
        $model = CollectionModel::find($id);
        
        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findAll(int $page = 1, int $perPage = 20, array $filters = []): array
    {
        $query = CollectionModel::query();

        if (isset($filters['supplier_id'])) {
            $query->where('supplier_id', $filters['supplier_id']);
        }

        if (isset($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['start_date'])) {
            $query->whereDate('collection_date', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date'])) {
            $query->whereDate('collection_date', '<=', $filters['end_date']);
        }

        $models = $query->orderBy('collection_date', 'desc')
                       ->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => $models->map(fn($model) => $this->toDomainEntity($model))->all(),
            'total' => $models->total(),
            'page' => $models->currentPage(),
            'per_page' => $models->perPage(),
            'last_page' => $models->lastPage(),
        ];
    }

    public function findBySupplier(string $supplierId, int $page = 1, int $perPage = 20): array
    {
        return $this->findAll($page, $perPage, ['supplier_id' => $supplierId]);
    }

    public function findBySupplierId(
        string $supplierId,
        ?DateTimeImmutable $startDate = null,
        ?DateTimeImmutable $endDate = null
    ): array {
        $query = CollectionModel::where('supplier_id', $supplierId);

        if ($startDate) {
            $query->whereDate('collection_date', '>=', $startDate->format('Y-m-d'));
        }

        if ($endDate) {
            $query->whereDate('collection_date', '<=', $endDate->format('Y-m-d'));
        }

        $models = $query->orderBy('collection_date', 'desc')->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->all();
    }

    public function findByProduct(string $productId, int $page = 1, int $perPage = 20): array
    {
        return $this->findAll($page, $perPage, ['product_id' => $productId]);
    }

    public function findByDateRange(
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate,
        ?string $supplierId = null,
        ?string $productId = null
    ): array {
        $query = CollectionModel::whereBetween('collection_date', [
            $startDate->format('Y-m-d'),
            $endDate->format('Y-m-d')
        ]);

        if ($supplierId) {
            $query->where('supplier_id', $supplierId);
        }

        if ($productId) {
            $query->where('product_id', $productId);
        }

        $models = $query->orderBy('collection_date', 'desc')->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->all();
    }

    public function save(Collection $collection): Collection
    {
        $data = $this->toModelData($collection);
        
        CollectionModel::updateOrCreate(
            ['id' => $collection->id()],
            $data
        );

        return $collection;
    }

    public function delete(string $id): bool
    {
        $model = CollectionModel::find($id);
        
        if (!$model) {
            return false;
        }

        return $model->delete();
    }

    public function exists(string $id): bool
    {
        return CollectionModel::where('id', $id)->exists();
    }
}
