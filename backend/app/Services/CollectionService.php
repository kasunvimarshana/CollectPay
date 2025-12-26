<?php

namespace App\Services;

use App\Models\Collection;
use App\Models\Payment;
use App\Models\Rate;
use App\Models\AuditLog;
use App\Repositories\CollectionRepository;
use App\Repositories\PaymentRepository;
use App\Repositories\RateRepository;
use Illuminate\Support\Str;

class CollectionService
{
    protected CollectionRepository $repository;

    public function __construct()
    {
        $this->repository = new CollectionRepository();
    }

    /**
     * Create a new collection.
     */
    public function create(array $data, int $userId, string $deviceId = null): Collection
    {
        $data['uuid'] = Str::uuid();
        $data['created_by'] = $userId;
        $data['updated_by'] = $userId;
        $data['status'] = 'active';
        $data['version'] = 1;
        $data['device_id'] = $deviceId;

        $collection = Collection::create($data);

        // Log audit
        $this->logAudit('created', 'collections', $collection->id, $collection->uuid, null, $collection->toArray(), $userId);

        return $collection;
    }

    /**
     * Update a collection.
     */
    public function update(string $uuid, array $data, int $userId): Collection
    {
        $collection = Collection::where('uuid', $uuid)->firstOrFail();
        $oldValues = $collection->toArray();

        $data['updated_by'] = $userId;
        $data['version'] = ($collection->version ?? 0) + 1;

        $collection->update($data);

        // Log audit
        $this->logAudit('updated', 'collections', $collection->id, $collection->uuid, $oldValues, $collection->toArray(), $userId);

        return $collection;
    }

    /**
     * Delete a collection.
     */
    public function delete(string $uuid, int $userId): bool
    {
        $collection = Collection::where('uuid', $uuid)->firstOrFail();

        // Log audit
        $this->logAudit('deleted', 'collections', $collection->id, $collection->uuid, $collection->toArray(), null, $userId);

        return (bool) $collection->delete();
    }

    /**
     * Get a single collection with related data.
     */
    public function getById(string $uuid): Collection
    {
        return Collection::where('uuid', $uuid)
            ->with(['creator', 'updater', 'payments', 'rates'])
            ->firstOrFail();
    }

    /**
     * Get all collections with pagination.
     */
    public function getAll(int $page = 1, int $limit = 20): \Illuminate\Pagination\Paginator
    {
        return Collection::with(['creator', 'payments', 'rates'])
            ->orderBy('created_at', 'desc')
            ->paginate($limit, ['*'], 'page', $page);
    }

    /**
     * Get collections for a specific user.
     */
    public function getByUser(int $userId): \Illuminate\Database\Eloquent\Collection
    {
        return Collection::where('created_by', $userId)
            ->with(['payments', 'rates'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get collection with payments and calculate totals.
     */
    public function getWithPaymentSummary(string $uuid): array
    {
        $collection = $this->getById($uuid);

        $payments = $collection->payments()
            ->with('rate')
            ->get();

        $totalAmount = $payments->sum('amount');
        $paymentCount = $payments->count();
        $latestRate = $collection->rates()
            ->where('is_active', true)
            ->orderBy('effective_from', 'desc')
            ->first();

        return [
            'collection' => $collection,
            'payments' => $payments,
            'summary' => [
                'total_amount' => $totalAmount,
                'payment_count' => $paymentCount,
                'latest_rate' => $latestRate,
                'currency' => $payments->first()?->currency ?? 'USD',
            ],
        ];
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
