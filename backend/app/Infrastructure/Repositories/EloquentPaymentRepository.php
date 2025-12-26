<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Entities\PaymentEntity;
use App\Domain\Repositories\PaymentRepositoryInterface;
use App\Domain\Exceptions\EntityNotFoundException;
use App\Domain\Exceptions\VersionConflictException;
use App\Models\Payment;

/**
 * Eloquent Payment Repository
 * 
 * Infrastructure implementation of PaymentRepositoryInterface using Eloquent ORM.
 * Converts between Eloquent models and domain entities.
 */
class EloquentPaymentRepository implements PaymentRepositoryInterface
{
    public function findById(int $id): ?PaymentEntity
    {
        $model = Payment::find($id);
        
        return $model ? $this->toEntity($model) : null;
    }

    public function findAll(array $filters = [], int $page = 1, int $perPage = 15): array
    {
        $query = Payment::query();

        // Apply filters
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

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'payment_date';
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

        return $query->count();
    }

    public function save(PaymentEntity $payment): PaymentEntity
    {
        $model = new Payment();
        $this->fillModel($model, $payment);
        $model->save();

        return $this->toEntity($model->fresh());
    }

    public function update(PaymentEntity $payment): PaymentEntity
    {
        $model = Payment::find($payment->getId());

        if (!$model) {
            throw new EntityNotFoundException("Payment not found with ID: {$payment->getId()}");
        }

        // Version conflict check
        if ($model->version != $payment->getVersion()) {
            throw new VersionConflictException(
                "Version mismatch. Expected: {$model->version}, Got: {$payment->getVersion()}"
            );
        }

        $this->fillModel($model, $payment);
        $model->version = $payment->getVersion() + 1;
        $model->save();

        return $this->toEntity($model->fresh());
    }

    public function delete(int $id): bool
    {
        $model = Payment::find($id);
        
        if (!$model) {
            return false;
        }

        return $model->delete();
    }

    /**
     * Convert Eloquent model to domain entity
     */
    private function toEntity(Payment $model): PaymentEntity
    {
        return new PaymentEntity(
            supplierId: $model->supplier_id,
            userId: $model->user_id,
            paymentDate: new \DateTimeImmutable($model->payment_date),
            amount: (float) $model->amount,
            paymentType: $model->payment_type,
            paymentMethod: $model->payment_method,
            referenceNumber: $model->reference_number,
            notes: $model->notes,
            metadata: $model->metadata,
            version: $model->version,
            id: $model->id
        );
    }

    /**
     * Fill Eloquent model from domain entity
     */
    private function fillModel(Payment $model, PaymentEntity $entity): void
    {
        $model->supplier_id = $entity->getSupplierId();
        $model->user_id = $entity->getUserId();
        $model->payment_date = $entity->getPaymentDate()->format('Y-m-d');
        $model->amount = $entity->getAmount();
        $model->payment_type = $entity->getPaymentType();
        $model->payment_method = $entity->getPaymentMethod();
        $model->reference_number = $entity->getReferenceNumber();
        $model->notes = $entity->getNotes();
        $model->metadata = $entity->getMetadata();
    }
}
