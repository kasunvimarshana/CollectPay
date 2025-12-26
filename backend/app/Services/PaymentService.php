<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Rate;
use App\Models\AuditLog;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PaymentService
{
    /**
     * Create a new payment with idempotency support.
     */
    public function create(array $data, int $userId, string $deviceId = null): Payment
    {
        // Generate idempotency key if not provided
        if (!isset($data['idempotency_key'])) {
            $data['idempotency_key'] = $this->generateIdempotencyKey($deviceId ?? 'unknown');
        }

        // Check for duplicate payment with same idempotency key
        $existingPayment = Payment::where('idempotency_key', $data['idempotency_key'])->first();
        if ($existingPayment) {
            return $existingPayment;
        }

        $data['uuid'] = Str::uuid();
        $data['created_by'] = $userId;
        $data['updated_by'] = $userId;
        $data['status'] = 'pending';
        $data['version'] = 1;
        $data['device_id'] = $deviceId;

        // Generate payment reference
        if (!isset($data['payment_reference'])) {
            $data['payment_reference'] = $this->generatePaymentReference();
        }

        // Apply current rate if not specified
        if (!isset($data['rate_id']) && isset($data['collection_id'])) {
            $rate = Rate::where('collection_id', $data['collection_id'])
                ->where('is_active', true)
                ->where('effective_from', '<=', now())
                ->where(function ($q) {
                    $q->whereNull('effective_until')
                      ->orWhere('effective_until', '>=', now());
                })
                ->orderBy('version', 'desc')
                ->first();

            if ($rate) {
                $data['rate_id'] = $rate->id;
            }
        }

        $payment = Payment::create($data);

        // Log audit
        $this->logAudit('created', 'payments', $payment->id, $payment->uuid, null, $payment->toArray(), $userId);

        return $payment;
    }

    /**
     * Update a payment.
     */
    public function update(string $uuid, array $data, int $userId): Payment
    {
        $payment = Payment::where('uuid', $uuid)->firstOrFail();
        $oldValues = $payment->toArray();

        $data['updated_by'] = $userId;
        $data['version'] = ($payment->version ?? 0) + 1;

        $payment->update($data);

        // Log audit
        $this->logAudit('updated', 'payments', $payment->id, $payment->uuid, $oldValues, $payment->toArray(), $userId);

        return $payment;
    }

    /**
     * Delete a payment.
     */
    public function delete(string $uuid, int $userId): bool
    {
        $payment = Payment::where('uuid', $uuid)->firstOrFail();

        // Log audit
        $this->logAudit('deleted', 'payments', $payment->id, $payment->uuid, $payment->toArray(), null, $userId);

        return (bool) $payment->delete();
    }

    /**
     * Get a single payment.
     */
    public function getById(string $uuid): Payment
    {
        return Payment::where('uuid', $uuid)
            ->with(['collection', 'rate', 'payer', 'creator', 'updater'])
            ->firstOrFail();
    }

    /**
     * Get all payments with pagination.
     */
    public function getAll(int $page = 1, int $limit = 20, array $filters = []): \Illuminate\Pagination\Paginator
    {
        $query = Payment::with(['collection', 'rate', 'payer']);

        if (isset($filters['collection_id'])) {
            $query->where('collection_id', $filters['collection_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['date_from'])) {
            $query->where('payment_date', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('payment_date', '<=', $filters['date_to']);
        }

        return $query->orderBy('payment_date', 'desc')
            ->paginate($limit, ['*'], 'page', $page);
    }

    /**
     * Batch create payments.
     */
    public function batchCreate(array $payments, int $userId, string $deviceId = null): array
    {
        $results = [];

        foreach ($payments as $paymentData) {
            try {
                $results[] = [
                    'success' => true,
                    'payment' => $this->create($paymentData, $userId, $deviceId),
                ];
            } catch (\Exception $e) {
                $results[] = [
                    'success' => false,
                    'error' => $e->getMessage(),
                    'data' => $paymentData,
                ];
            }
        }

        return $results;
    }

    /**
     * Calculate automatic payment based on collections and rates.
     */
    public function calculateAutoPayment(int $collectionId, int $rateId): float
    {
        $collection = \App\Models\Collection::findOrFail($collectionId);
        $rate = Rate::findOrFail($rateId);

        // Sum all collection quantities
        $totalQuantity = $collection->metadata['total_quantity'] ?? 0;

        // Calculate total amount
        return round($totalQuantity * $rate->amount, 2);
    }

    /**
     * Generate a unique payment reference.
     */
    protected function generatePaymentReference(): string
    {
        do {
            $reference = 'PAY-' . strtoupper(Str::random(10));
        } while (Payment::where('payment_reference', $reference)->exists());

        return $reference;
    }

    /**
     * Generate idempotency key.
     */
    protected function generateIdempotencyKey(string $deviceId): string
    {
        return $deviceId . '-' . time() . '-' . Str::random(8);
    }

    /**
     * Log an audit entry.
     */
    protected function logAudit(string $action, string $entityType, int $entityId, string $entityUuid, ?array $oldValues, ?array $newValues, int $userId): void
    {
        AuditLog::create([
            'user_id' => $userId,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'entity_uuid' => $entityUuid,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'device_id' => request()->header('X-Device-ID'),
        ]);
    }
}
