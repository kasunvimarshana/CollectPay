<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Entities\PaymentEntity;
use App\Domain\Repositories\PaymentRepositoryInterface;
use App\Models\Payment;

/**
 * Eloquent Payment Repository
 *
 * Infrastructure implementation of the PaymentRepositoryInterface.
 * Bridges the domain layer with Laravel's Eloquent ORM.
 */
class EloquentPaymentRepository implements PaymentRepositoryInterface
{
    /**
     * Convert Eloquent model to Domain entity
     */
    private function toDomainEntity(Payment $model): PaymentEntity
    {
        return new PaymentEntity(
            supplierId: $model->supplier_id,
            amount: (float) $model->amount,
            paymentType: $model->payment_type,
            paymentDate: new \DateTime($model->payment_date),
            recordedBy: $model->recorded_by,
            paymentMethod: $model->payment_method,
            referenceNumber: $model->reference_number,
            notes: $model->notes,
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
    private function toModelAttributes(PaymentEntity $entity): array
    {
        return [
            'supplier_id' => $entity->getSupplierId(),
            'amount' => $entity->getAmount(),
            'payment_type' => $entity->getPaymentType(),
            'payment_date' => $entity->getPaymentDate()->format('Y-m-d'),
            'payment_method' => $entity->getPaymentMethod(),
            'reference_number' => $entity->getReferenceNumber(),
            'notes' => $entity->getNotes(),
            'recorded_by' => $entity->getRecordedBy(),
            'metadata' => $entity->getMetadata(),
            'version' => $entity->getVersion(),
        ];
    }

    public function save(PaymentEntity $entity): PaymentEntity
    {
        $attributes = $this->toModelAttributes($entity);

        if ($entity->getId() === null) {
            // Create new
            $model = Payment::create($attributes);
        } else {
            // Update existing
            $model = Payment::findOrFail($entity->getId());
            $model->update($attributes);
        }

        return $this->toDomainEntity($model);
    }

    public function findById(int $id): ?PaymentEntity
    {
        $model = Payment::find($id);

        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findBySupplier(int $supplierId, ?\DateTimeInterface $fromDate = null, ?\DateTimeInterface $toDate = null): array
    {
        $query = Payment::where('supplier_id', $supplierId);

        if ($fromDate !== null) {
            $query->where('payment_date', '>=', $fromDate->format('Y-m-d'));
        }

        if ($toDate !== null) {
            $query->where('payment_date', '<=', $toDate->format('Y-m-d'));
        }

        $models = $query->orderBy('payment_date', 'desc')->get();

        return $models->map(fn ($model) => $this->toDomainEntity($model))->all();
    }

    public function findByType(string $paymentType): array
    {
        $models = Payment::where('payment_type', $paymentType)->get();

        return $models->map(fn ($model) => $this->toDomainEntity($model))->all();
    }

    public function list(array $filters = [], int $page = 1, int $perPage = 15): array
    {
        $query = Payment::query();

        if (isset($filters['supplier_id'])) {
            $query->where('supplier_id', $filters['supplier_id']);
        }

        if (isset($filters['payment_type'])) {
            $query->where('payment_type', $filters['payment_type']);
        }

        if (isset($filters['from_date'])) {
            $query->where('payment_date', '>=', $filters['from_date']);
        }

        if (isset($filters['to_date'])) {
            $query->where('payment_date', '<=', $filters['to_date']);
        }

        $paginator = $query->orderBy('payment_date', 'desc')->paginate($perPage, ['*'], 'page', $page);

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
        $model = Payment::findOrFail($id);

        return $model->delete();
    }

    public function exists(int $id): bool
    {
        return Payment::where('id', $id)->exists();
    }

    public function getTotalAmountBySupplier(int $supplierId, ?\DateTimeInterface $fromDate = null, ?\DateTimeInterface $toDate = null): float
    {
        $query = Payment::where('supplier_id', $supplierId);

        if ($fromDate !== null) {
            $query->where('payment_date', '>=', $fromDate->format('Y-m-d'));
        }

        if ($toDate !== null) {
            $query->where('payment_date', '<=', $toDate->format('Y-m-d'));
        }

        return (float) $query->sum('amount');
    }

    public function findByReferenceNumber(string $referenceNumber): ?PaymentEntity
    {
        $model = Payment::where('reference_number', $referenceNumber)->first();

        return $model ? $this->toDomainEntity($model) : null;
    }
}
