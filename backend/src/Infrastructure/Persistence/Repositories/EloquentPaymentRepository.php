<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Repositories;

use Domain\Entities\Payment;
use Domain\Repositories\PaymentRepositoryInterface;
use Domain\ValueObjects\Money;
use Infrastructure\Persistence\Eloquent\Models\PaymentModel;
use DateTimeImmutable;

/**
 * Eloquent Payment Repository Implementation
 */
final class EloquentPaymentRepository implements PaymentRepositoryInterface
{
    public function save(Payment $payment): void
    {
        $model = PaymentModel::find($payment->getId()) ?? new PaymentModel();

        $model->fill([
            'id' => $payment->getId(),
            'supplier_id' => $payment->getSupplierId(),
            'type' => $payment->getType(),
            'amount' => $payment->getAmount()->getAmount(),
            'currency' => $payment->getAmount()->getCurrency(),
            'payment_date' => $payment->getPaymentDate()->format('Y-m-d H:i:s'),
            'paid_by' => $payment->getPaidBy(),
            'reference_number' => $payment->getReferenceNumber(),
            'notes' => $payment->getNotes(),
        ]);

        if (!$model->exists) {
            $model->created_at = $payment->getCreatedAt()->format('Y-m-d H:i:s');
        }
        $model->updated_at = $payment->getUpdatedAt()->format('Y-m-d H:i:s');

        $model->save();
    }

    public function findById(string $id): ?Payment
    {
        $model = PaymentModel::find($id);

        if (!$model) {
            return null;
        }

        return $this->toDomainEntity($model);
    }

    public function findBySupplierId(
        string $supplierId,
        int $page = 1,
        int $perPage = 20
    ): array {
        $models = PaymentModel::where('supplier_id', $supplierId)
            ->orderBy('payment_date', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->toArray();
    }

    public function findBySupplierAndDateRange(
        string $supplierId,
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate
    ): array {
        $models = PaymentModel::where('supplier_id', $supplierId)
            ->whereBetween('payment_date', [
                $startDate->format('Y-m-d H:i:s'),
                $endDate->format('Y-m-d H:i:s')
            ])
            ->orderBy('payment_date', 'desc')
            ->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->toArray();
    }

    public function findAll(int $page = 1, int $perPage = 20): array
    {
        $models = PaymentModel::orderBy('payment_date', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->toArray();
    }

    public function delete(string $id): void
    {
        $model = PaymentModel::find($id);
        if ($model) {
            $model->delete();
        }
    }

    private function toDomainEntity(PaymentModel $model): Payment
    {
        return Payment::reconstitute(
            $model->id,
            $model->supplier_id,
            $model->type,
            Money::fromFloat(
                (float) $model->amount,
                $model->currency
            ),
            new DateTimeImmutable($model->payment_date),
            $model->paid_by,
            $model->reference_number,
            $model->notes,
            new DateTimeImmutable($model->created_at),
            new DateTimeImmutable($model->updated_at),
            $model->deleted_at ? new DateTimeImmutable($model->deleted_at) : null
        );
    }
}
