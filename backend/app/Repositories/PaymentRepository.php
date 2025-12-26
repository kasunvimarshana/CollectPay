<?php

namespace App\Repositories;

use App\Models\Payment as PaymentModel;
use Src\Domain\Entities\Payment;
use Src\Domain\Repositories\PaymentRepositoryInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PaymentRepository implements PaymentRepositoryInterface
{
    public function findById(int $id): ?Payment
    {
        $model = PaymentModel::find($id);
        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findByUuid(string $uuid): ?Payment
    {
        $model = PaymentModel::where('uuid', $uuid)->first();
        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findByIdempotencyKey(string $key): ?Payment
    {
        $model = PaymentModel::where('idempotency_key', $key)->first();
        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findAll(array $filters = []): array
    {
        $query = PaymentModel::query();

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['collection_id'])) {
            $query->where('collection_id', $filters['collection_id']);
        }

        if (isset($filters['payer_id'])) {
            $query->where('payer_id', $filters['payer_id']);
        }

        if (isset($filters['synced_at'])) {
            $query->where('synced_at', '>=', $filters['synced_at']);
        }

        return $query->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($model) => $this->toDomainEntity($model))
            ->toArray();
    }

    public function create(array $data): Payment
    {
        $model = PaymentModel::create($data);
        return $this->toDomainEntity($model);
    }

    public function update(string $uuid, array $data): Payment
    {
        $model = PaymentModel::where('uuid', $uuid)->firstOrFail();

        // Increment version for conflict detection
        $data['version'] = ($model->version ?? 0) + 1;

        $model->update($data);
        return $this->toDomainEntity($model);
    }

    public function delete(string $uuid): bool
    {
        $model = PaymentModel::where('uuid', $uuid)->firstOrFail();
        return (bool) $model->delete();
    }

    public function findForCollection(int $collectionId): array
    {
        return PaymentModel::where('collection_id', $collectionId)
            ->orderBy('payment_date', 'desc')
            ->get()
            ->map(fn($model) => $this->toDomainEntity($model))
            ->toArray();
    }

    public function findForSync(string $deviceId, ?string $lastSyncedAt): array
    {
        $query = PaymentModel::query();

        if ($lastSyncedAt) {
            $query->where('updated_at', '>=', $lastSyncedAt);
        }

        if ($deviceId !== 'server') {
            $query->where(function ($q) use ($deviceId) {
                $q->where('device_id', $deviceId)
                  ->orWhereNull('device_id');
            });
        }

        return $query->orderBy('updated_at', 'desc')
            ->get()
            ->map(fn($model) => $this->toDomainEntity($model))
            ->toArray();
    }

    private function toDomainEntity(PaymentModel $model): Payment
    {
        return new Payment(
            $model->id,
            $model->uuid,
            $model->payment_reference,
            $model->collection_id,
            $model->rate_id,
            $model->payer_id,
            $model->amount,
            $model->currency,
            $model->status,
            $model->payment_method,
            $model->notes,
            $model->payment_date->toDateTimeString(),
            $model->processed_at?->toDateTimeString(),
            $model->is_automated,
            $model->metadata,
            $model->version,
            $model->created_by,
            $model->updated_by,
            $model->synced_at?->toDateTimeString(),
            $model->device_id,
            $model->idempotency_key,
            $model->created_at?->toDateTimeString(),
            $model->updated_at?->toDateTimeString(),
            $model->deleted_at?->toDateTimeString(),
        );
    }
}
