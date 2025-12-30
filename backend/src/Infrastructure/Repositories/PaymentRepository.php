<?php

declare(strict_types=1);

namespace Infrastructure\Repositories;

use Domain\Entities\Payment;
use Domain\Repositories\PaymentRepositoryInterface;
use Domain\ValueObjects\Money;
use Infrastructure\Persistence\Eloquent\PaymentModel;
use DateTimeImmutable;

/**
 * Eloquent-based Payment Repository Implementation
 */
class PaymentRepository implements PaymentRepositoryInterface
{
    private function toDomainEntity(PaymentModel $model): Payment
    {
        $money = new Money($model->amount, $model->currency);

        return Payment::create(
            id: $model->id,
            supplierId: $model->supplier_id,
            userId: $model->user_id,
            amount: $money,
            type: $model->type,
            paymentDate: new DateTimeImmutable($model->payment_date),
            reference: $model->reference,
            notes: $model->notes,
            metadata: $model->metadata ?? []
        );
    }

    private function toModelData(Payment $payment): array
    {
        return [
            'id' => $payment->id(),
            'supplier_id' => $payment->supplierId(),
            'user_id' => $payment->userId(),
            'amount' => $payment->amount()->amount(),
            'currency' => $payment->amount()->currency(),
            'type' => $payment->type(),
            'payment_date' => $payment->paymentDate()->format('Y-m-d H:i:s'),
            'reference' => $payment->reference(),
            'notes' => $payment->notes(),
            'metadata' => $payment->metadata(),
        ];
    }

    public function findById(string $id): ?Payment
    {
        $model = PaymentModel::find($id);
        
        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findAll(int $page = 1, int $perPage = 20, array $filters = []): array
    {
        $query = PaymentModel::query();

        if (isset($filters['supplier_id'])) {
            $query->where('supplier_id', $filters['supplier_id']);
        }

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['payment_type'])) {
            $query->where('type', $filters['payment_type']);
        }

        if (isset($filters['start_date'])) {
            $query->whereDate('payment_date', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date'])) {
            $query->whereDate('payment_date', '<=', $filters['end_date']);
        }

        $models = $query->orderBy('payment_date', 'desc')
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
        $query = PaymentModel::where('supplier_id', $supplierId);

        if ($startDate) {
            $query->whereDate('payment_date', '>=', $startDate->format('Y-m-d'));
        }

        if ($endDate) {
            $query->whereDate('payment_date', '<=', $endDate->format('Y-m-d'));
        }

        $models = $query->orderBy('payment_date', 'desc')->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->all();
    }

    public function findByDateRange(
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate,
        ?string $supplierId = null
    ): array {
        $query = PaymentModel::whereBetween('payment_date', [
            $startDate->format('Y-m-d'),
            $endDate->format('Y-m-d')
        ]);

        if ($supplierId) {
            $query->where('supplier_id', $supplierId);
        }

        $models = $query->orderBy('payment_date', 'desc')->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->all();
    }

    public function save(Payment $payment): Payment
    {
        $data = $this->toModelData($payment);
        
        PaymentModel::updateOrCreate(
            ['id' => $payment->id()],
            $data
        );

        return $payment;
    }

    public function delete(string $id): bool
    {
        $model = PaymentModel::find($id);
        
        if (!$model) {
            return false;
        }

        return $model->delete();
    }

    public function exists(string $id): bool
    {
        return PaymentModel::where('id', $id)->exists();
    }
}
