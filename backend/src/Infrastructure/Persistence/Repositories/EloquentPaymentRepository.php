<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Repositories;

use Domain\Entities\Payment;
use Domain\Repositories\PaymentRepositoryInterface;
use Domain\ValueObjects\UUID;
use Domain\ValueObjects\Money;
use Infrastructure\Persistence\Eloquent\PaymentModel;
use DateTimeImmutable;

final class EloquentPaymentRepository implements PaymentRepositoryInterface
{
    public function save(Payment $payment): void
    {
        PaymentModel::updateOrCreate(
            ['id' => $payment->id()->value()],
            [
                'supplier_id' => $payment->supplierId()->value(),
                'amount' => $payment->amount()->amount(),
                'currency' => $payment->amount()->currency(),
                'type' => $payment->type(),
                'payment_date' => $payment->paymentDate(),
                'reference' => $payment->reference(),
                'notes' => $payment->notes(),
                'version' => $payment->version(),
                'updated_at' => $payment->updatedAt(),
            ]
        );
    }

    public function findById(UUID $id): ?Payment
    {
        $model = PaymentModel::find($id->value());
        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findBySupplierId(UUID $supplierId, ?DateTimeImmutable $from = null, ?DateTimeImmutable $to = null): array
    {
        $query = PaymentModel::where('supplier_id', $supplierId->value());

        if ($from) {
            $query->where('payment_date', '>=', $from);
        }

        if ($to) {
            $query->where('payment_date', '<=', $to);
        }

        $models = $query->orderBy('payment_date', 'desc')->get();
        return $models->map(fn($model) => $this->toDomainEntity($model))->all();
    }

    public function findAll(int $page = 1, int $perPage = 30, ?array $filters = null): array
    {
        $query = PaymentModel::query();

        if ($filters) {
            if (isset($filters['supplier_id'])) {
                $query->where('supplier_id', $filters['supplier_id']);
            }
            if (isset($filters['type'])) {
                $query->where('type', $filters['type']);
            }
            if (isset($filters['from'])) {
                $query->where('payment_date', '>=', $filters['from']);
            }
            if (isset($filters['to'])) {
                $query->where('payment_date', '<=', $filters['to']);
            }
        }

        $models = $query->orderBy('payment_date', 'desc')
                        ->skip(($page - 1) * $perPage)
                        ->take($perPage)
                        ->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->all();
    }

    public function count(?array $filters = null): int
    {
        $query = PaymentModel::query();

        if ($filters) {
            if (isset($filters['supplier_id'])) {
                $query->where('supplier_id', $filters['supplier_id']);
            }
            if (isset($filters['type'])) {
                $query->where('type', $filters['type']);
            }
            if (isset($filters['from'])) {
                $query->where('payment_date', '>=', $filters['from']);
            }
            if (isset($filters['to'])) {
                $query->where('payment_date', '<=', $filters['to']);
            }
        }

        return $query->count();
    }

    public function delete(UUID $id): void
    {
        PaymentModel::where('id', $id->value())->delete();
    }

    private function toDomainEntity(PaymentModel $model): Payment
    {
        return Payment::reconstitute(
            $model->id,
            $model->supplier_id,
            (float) $model->amount,
            $model->currency,
            $model->type,
            new DateTimeImmutable($model->payment_date),
            $model->reference,
            $model->notes,
            new DateTimeImmutable($model->created_at),
            new DateTimeImmutable($model->updated_at),
            $model->version
        );
    }
}
