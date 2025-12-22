<?php

namespace Infrastructure\Persistence\Eloquent\Repositories;

use Domain\Payment\Payment;
use Domain\Payment\PaymentRepositoryInterface;
use Domain\Payment\PaymentType;
use Domain\Payment\PaymentMethod;
use Domain\Payment\PaymentStatus;
use Domain\Shared\ValueObjects\Money;
use Domain\Shared\ValueObjects\Uuid;
use Infrastructure\Persistence\Eloquent\Models\PaymentModel;
use DateTimeImmutable;

class PaymentRepository implements PaymentRepositoryInterface
{
    public function save(Payment $payment): void
    {
        $model = PaymentModel::findOrNew($payment->id()->value());
        
        $model->id = $payment->id()->value();
        $model->supplier_id = $payment->supplierId()->value();
        $model->paid_by = $payment->paidBy()->value();
        $model->amount = $payment->amount()->amount();
        $model->currency = $payment->amount()->currency();
        $model->type = $payment->type()->value();
        $model->method = $payment->method()->value();
        $model->status = $payment->status()->value();
        $model->reference_number = $payment->referenceNumber();
        $model->notes = $payment->notes();
        $model->payment_date = $payment->paymentDate();
        $model->sync_id = $payment->syncId();
        
        $model->save();
    }

    public function findById(string $id): ?Payment
    {
        $model = PaymentModel::find($id);
        
        return $model ? $this->toDomain($model) : null;
    }

    public function findBySupplierId(string $supplierId, int $page = 1, int $perPage = 20): array
    {
        $models = PaymentModel::where('supplier_id', $supplierId)
            ->orderBy('payment_date', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();
        
        return $models->map(fn($model) => $this->toDomain($model))->all();
    }

    public function findByPaidBy(string $userId, int $page = 1, int $perPage = 20): array
    {
        $models = PaymentModel::where('paid_by', $userId)
            ->orderBy('payment_date', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();
        
        return $models->map(fn($model) => $this->toDomain($model))->all();
    }

    public function findByStatus(string $status, int $page = 1, int $perPage = 20): array
    {
        $models = PaymentModel::where('status', $status)
            ->orderBy('payment_date', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();
        
        return $models->map(fn($model) => $this->toDomain($model))->all();
    }

    public function findByDateRange(DateTimeImmutable $from, DateTimeImmutable $to): array
    {
        $models = PaymentModel::whereBetween('payment_date', [$from, $to])
            ->orderBy('payment_date', 'desc')
            ->get();
        
        return $models->map(fn($model) => $this->toDomain($model))->all();
    }

    public function findBySyncId(string $syncId): ?Payment
    {
        $model = PaymentModel::where('sync_id', $syncId)->first();
        
        return $model ? $this->toDomain($model) : null;
    }

    public function delete(string $id): void
    {
        PaymentModel::where('id', $id)->delete();
    }

    public function getTotalPaidToSupplier(string $supplierId): int
    {
        return PaymentModel::where('supplier_id', $supplierId)
            ->where('status', 'confirmed')
            ->sum('amount');
    }

    public function getPaymentsByType(string $supplierId, string $type): array
    {
        $models = PaymentModel::where('supplier_id', $supplierId)
            ->where('type', $type)
            ->where('status', 'confirmed')
            ->orderBy('payment_date', 'desc')
            ->get();
        
        return $models->map(fn($model) => $this->toDomain($model))->all();
    }

    private function toDomain(PaymentModel $model): Payment
    {
        return Payment::reconstitute(
            Uuid::fromString($model->id),
            Uuid::fromString($model->supplier_id),
            Uuid::fromString($model->paid_by),
            Money::fromCents($model->amount, $model->currency),
            PaymentType::fromString($model->type),
            PaymentMethod::fromString($model->method),
            PaymentStatus::fromString($model->status),
            $model->reference_number,
            $model->notes,
            $model->payment_date->toDateTimeImmutable(),
            $model->created_at->toDateTimeImmutable(),
            $model->updated_at->toDateTimeImmutable(),
            $model->sync_id
        );
    }
}
