<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class AuditService
{
    /**
     * Log an action
     */
    public function log(
        string $action,
        string $entityType,
        ?int $entityId = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $description = null
    ): void {
        try {
            AuditLog::create([
                'user_id' => auth()->id(),
                'action' => $action,
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'old_values' => $oldValues,
                'new_values' => $newValues,
                'description' => $description,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Exception $e) {
            // Log to file if database logging fails
            Log::warning('Failed to create audit log', [
                'action' => $action,
                'entity_type' => $entityType,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Log model creation
     */
    public function logCreate(Model $model): void
    {
        $this->log(
            'create',
            $model->getTable(),
            $model->id,
            null,
            $model->toArray(),
            "Created {$model->getTable()} record"
        );
    }

    /**
     * Log model update
     */
    public function logUpdate(Model $model, array $originalValues): void
    {
        $changes = $model->getChanges();
        
        $this->log(
            'update',
            $model->getTable(),
            $model->id,
            array_intersect_key($originalValues, $changes),
            $changes,
            "Updated {$model->getTable()} record"
        );
    }

    /**
     * Log model deletion
     */
    public function logDelete(Model $model): void
    {
        $this->log(
            'delete',
            $model->getTable(),
            $model->id,
            $model->toArray(),
            null,
            "Deleted {$model->getTable()} record"
        );
    }

    /**
     * Log sync operation
     */
    public function logSync(string $deviceId, int $successCount, int $failedCount, array $conflicts = []): void
    {
        $this->log(
            'sync',
            'sync_operation',
            null,
            null,
            [
                'device_id' => $deviceId,
                'success_count' => $successCount,
                'failed_count' => $failedCount,
                'conflict_count' => count($conflicts),
            ],
            "Sync operation completed: {$successCount} success, {$failedCount} failed"
        );
    }

    /**
     * Log payment processing
     */
    public function logPayment(int $supplierId, float $amount, float $outstandingBefore, float $outstandingAfter): void
    {
        $this->log(
            'payment',
            'payment',
            null,
            ['outstanding' => $outstandingBefore],
            [
                'amount' => $amount,
                'outstanding' => $outstandingAfter,
            ],
            "Payment of {$amount} processed for supplier {$supplierId}"
        );
    }

    /**
     * Get audit logs for an entity
     */
    public function getLogsForEntity(string $entityType, int $entityId, int $limit = 50): array
    {
        return AuditLog::where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get recent audit logs
     */
    public function getRecentLogs(int $limit = 100): array
    {
        return AuditLog::with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }
}
