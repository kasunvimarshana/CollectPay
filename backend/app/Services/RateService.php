<?php

namespace App\Services;

use App\Models\Rate;
use App\Models\AuditLog;
use Illuminate\Support\Str;

class RateService
{
    /**
     * Create a new rate.
     */
    public function create(array $data, int $userId, string $deviceId = null): Rate
    {
        $data['uuid'] = Str::uuid();
        $data['created_by'] = $userId;
        $data['updated_by'] = $userId;
        $data['version'] = 1;
        $data['device_id'] = $deviceId;
        $data['is_active'] = $data['is_active'] ?? true;

        // Ensure effective_from is set
        if (!isset($data['effective_from'])) {
            $data['effective_from'] = now();
        }

        $rate = Rate::create($data);

        // Log audit
        $this->logAudit('created', 'rates', $rate->id, $rate->uuid, null, $rate->toArray(), $userId);

        return $rate;
    }

    /**
     * Create a new version of a rate (immutable historical records).
     */
    public function createVersion(string $uuid, array $data, int $userId): Rate
    {
        $originalRate = Rate::where('uuid', $uuid)->firstOrFail();

        // Deactivate current version
        $originalRate->update(['is_active' => false]);

        // Create new version
        $latestVersion = Rate::where('name', $originalRate->name)
            ->max('version');

        $data['uuid'] = Str::uuid();
        $data['name'] = $originalRate->name;
        $data['collection_id'] = $originalRate->collection_id;
        $data['created_by'] = $userId;
        $data['updated_by'] = $userId;
        $data['version'] = ($latestVersion ?? 0) + 1;
        $data['is_active'] = true;
        $data['effective_from'] = $data['effective_from'] ?? now();

        $newRate = Rate::create($data);

        // Log audit
        $this->logAudit('created_version', 'rates', $newRate->id, $newRate->uuid, $originalRate->toArray(), $newRate->toArray(), $userId);

        return $newRate;
    }

    /**
     * Deactivate a rate.
     */
    public function deactivate(string $uuid, int $userId): Rate
    {
        $rate = Rate::where('uuid', $uuid)->firstOrFail();
        $oldValues = $rate->toArray();

        $rate->update(['is_active' => false]);

        // Log audit
        $this->logAudit('deactivated', 'rates', $rate->id, $rate->uuid, $oldValues, $rate->toArray(), $userId);

        return $rate;
    }

    /**
     * Get a single rate.
     */
    public function getById(string $uuid): Rate
    {
        return Rate::where('uuid', $uuid)
            ->with(['collection', 'creator', 'updater', 'payments'])
            ->firstOrFail();
    }

    /**
     * Get all rates with pagination.
     */
    public function getAll(int $page = 1, int $limit = 20, array $filters = []): \Illuminate\Pagination\Paginator
    {
        $query = Rate::with(['collection', 'creator']);

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (isset($filters['collection_id'])) {
            $query->where('collection_id', $filters['collection_id']);
        }

        if (isset($filters['name'])) {
            $query->where('name', $filters['name']);
        }

        return $query->orderBy('version', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($limit, ['*'], 'page', $page);
    }

    /**
     * Get active rates only.
     */
    public function getActive(int $page = 1, int $limit = 20): \Illuminate\Pagination\Paginator
    {
        return Rate::active()
            ->with(['collection', 'creator'])
            ->orderBy('effective_from', 'desc')
            ->paginate($limit, ['*'], 'page', $page);
    }

    /**
     * Get all versions of a specific rate name.
     */
    public function getVersionsByName(string $name): \Illuminate\Database\Eloquent\Collection
    {
        return Rate::where('name', $name)
            ->with(['creator', 'updater', 'payments'])
            ->orderBy('version', 'desc')
            ->get();
    }

    /**
     * Get the current active version of a rate.
     */
    public function getCurrentVersion(string $name): ?Rate
    {
        return Rate::where('name', $name)
            ->active()
            ->orderBy('version', 'desc')
            ->first();
    }

    /**
     * Get rates for a specific collection.
     */
    public function getForCollection(int $collectionId): \Illuminate\Database\Eloquent\Collection
    {
        return Rate::where('collection_id', $collectionId)
            ->with(['creator', 'payments'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get rate applicable at a specific date.
     */
    public function getRateAtDate(string $rateName, \DateTime $date): ?Rate
    {
        return Rate::where('name', $rateName)
            ->where('effective_from', '<=', $date)
            ->where(function ($q) use ($date) {
                $q->whereNull('effective_until')
                  ->orWhere('effective_until', '>=', $date);
            })
            ->orderBy('version', 'desc')
            ->first();
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
