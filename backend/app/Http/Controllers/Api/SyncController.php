<?php

namespace App\Http\Controllers\Api;

use App\Models\SyncLog;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\Rate;
use App\Models\Collection;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncController extends ApiController
{
    private const BATCH_SIZE = 100;

    private const ENTITY_MODELS = [
        'suppliers' => Supplier::class,
        'products' => Product::class,
        'rates' => Rate::class,
        'collections' => Collection::class,
        'payments' => Payment::class,
    ];

    /**
     * Sync data from client to server (push)
     */
    public function push(Request $request)
    {
        $validated = $request->validate([
            'device_id' => 'required|string',
            'changes' => 'required|array',
            'changes.*.entity_type' => 'required|in:suppliers,products,rates,collections,payments',
            'changes.*.operation' => 'required|in:create,update,delete',
            'changes.*.data' => 'required|array',
            'changes.*.data.uuid' => 'required|uuid',
            'changes.*.data.version' => 'sometimes|integer',
        ]);

        $results = [
            'success' => [],
            'conflicts' => [],
            'errors' => [],
        ];

        DB::beginTransaction();
        try {
            foreach ($validated['changes'] as $change) {
                $result = $this->processChange(
                    $change['entity_type'],
                    $change['operation'],
                    $change['data'],
                    $request->user(),
                    $validated['device_id']
                );

                if ($result['status'] === 'success') {
                    $results['success'][] = $result;
                } elseif ($result['status'] === 'conflict') {
                    $results['conflicts'][] = $result;
                } else {
                    $results['errors'][] = $result;
                }
            }

            DB::commit();

            $statusCode = empty($results['conflicts']) && empty($results['errors']) ? 200 : 207;

            return response()->json([
                'success' => true,
                'message' => 'Sync completed',
                'results' => $results,
                'timestamp' => now()->toIso8601String(),
            ], $statusCode);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Sync push failed', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id,
            ]);

            return $this->error('Sync failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get data from server to client (pull)
     */
    public function pull(Request $request)
    {
        $validated = $request->validate([
            'device_id' => 'required|string',
            'last_sync' => 'nullable|date',
            'entities' => 'sometimes|array',
            'entities.*' => 'in:suppliers,products,rates,collections,payments',
        ]);

        $lastSync = $validated['last_sync'] ?? null;
        $entities = $validated['entities'] ?? array_keys(self::ENTITY_MODELS);

        $data = [];

        try {
            foreach ($entities as $entityType) {
                $modelClass = self::ENTITY_MODELS[$entityType];
                
                $query = $modelClass::query();

                if ($lastSync) {
                    $query->where(function ($q) use ($lastSync) {
                        $q->where('updated_at', '>', $lastSync)
                          ->orWhere('created_at', '>', $lastSync);
                    });
                }

                // Add relationships for better offline support
                if ($entityType === 'collections') {
                    $query->with(['supplier:id,uuid,name', 'product:id,uuid,name,unit']);
                } elseif ($entityType === 'payments') {
                    $query->with(['supplier:id,uuid,name']);
                } elseif ($entityType === 'rates') {
                    $query->with(['supplier:id,uuid,name', 'product:id,uuid,name']);
                }

                $data[$entityType] = $query->get();
            }

            return $this->success([
                'data' => $data,
                'timestamp' => now()->toIso8601String(),
                'has_more' => false, // Can be extended for pagination
            ]);

        } catch (\Exception $e) {
            Log::error('Sync pull failed', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id,
            ]);

            return $this->error('Failed to pull data: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get sync status
     */
    public function status(Request $request)
    {
        $validated = $request->validate([
            'device_id' => 'sometimes|string',
        ]);

        $query = SyncLog::where('user_id', $request->user()->id);

        if (isset($validated['device_id'])) {
            $query->where('device_id', $validated['device_id']);
        }

        $status = [
            'pending' => (clone $query)->pending()->count(),
            'failed' => (clone $query)->failed()->count(),
            'conflicts' => (clone $query)->conflicted()->count(),
            'last_sync' => (clone $query)->where('status', 'success')
                ->latest('synced_at')
                ->value('synced_at'),
            'recent_logs' => (clone $query)->latest()
                ->limit(10)
                ->get(),
        ];

        return $this->success($status);
    }

    /**
     * Process a single change
     */
    private function processChange(string $entityType, string $operation, array $data, $user, string $deviceId): array
    {
        $modelClass = self::ENTITY_MODELS[$entityType];
        $uuid = $data['uuid'];

        // Create sync log
        $syncLog = SyncLog::create([
            'user_id' => $user->id,
            'device_id' => $deviceId,
            'entity_type' => $entityType,
            'entity_uuid' => $uuid,
            'operation' => $operation,
            'payload' => $data,
            'status' => 'pending',
        ]);

        try {
            $existing = $modelClass::where('uuid', $uuid)->first();

            if ($operation === 'create') {
                if ($existing) {
                    // Already exists, check for conflicts
                    if (isset($data['version']) && $existing->version != $data['version']) {
                        $syncLog->markAsConflict([
                            'client_version' => $data['version'],
                            'server_version' => $existing->version,
                        ], 'server_wins');

                        return [
                            'status' => 'conflict',
                            'entity_type' => $entityType,
                            'uuid' => $uuid,
                            'server_data' => $existing,
                            'resolution' => 'server_wins',
                        ];
                    }
                    
                    // Same version or no version check, update instead
                    $existing->update($this->prepareData($data, $user));
                    $syncLog->markAsSuccess();

                    return [
                        'status' => 'success',
                        'operation' => 'updated',
                        'entity_type' => $entityType,
                        'uuid' => $uuid,
                        'data' => $existing->fresh(),
                    ];
                }

                // Create new
                $entity = $modelClass::create($this->prepareData($data, $user));
                $syncLog->markAsSuccess();

                return [
                    'status' => 'success',
                    'operation' => 'created',
                    'entity_type' => $entityType,
                    'uuid' => $uuid,
                    'data' => $entity,
                ];
            } elseif ($operation === 'update') {
                if (!$existing) {
                    // Doesn't exist, create instead
                    $entity = $modelClass::create($this->prepareData($data, $user));
                    $syncLog->markAsSuccess();

                    return [
                        'status' => 'success',
                        'operation' => 'created',
                        'entity_type' => $entityType,
                        'uuid' => $uuid,
                        'data' => $entity,
                    ];
                }

                // Check for version conflict
                if (isset($data['version']) && $existing->version != $data['version']) {
                    $syncLog->markAsConflict([
                        'client_version' => $data['version'],
                        'server_version' => $existing->version,
                    ], 'server_wins');

                    return [
                        'status' => 'conflict',
                        'entity_type' => $entityType,
                        'uuid' => $uuid,
                        'server_data' => $existing,
                        'resolution' => 'server_wins',
                    ];
                }

                $existing->update($this->prepareData($data, $user, false));
                $syncLog->markAsSuccess();

                return [
                    'status' => 'success',
                    'operation' => 'updated',
                    'entity_type' => $entityType,
                    'uuid' => $uuid,
                    'data' => $existing->fresh(),
                ];
            } elseif ($operation === 'delete') {
                if ($existing) {
                    $existing->delete();
                }

                $syncLog->markAsSuccess();

                return [
                    'status' => 'success',
                    'operation' => 'deleted',
                    'entity_type' => $entityType,
                    'uuid' => $uuid,
                ];
            }

        } catch (\Exception $e) {
            $syncLog->markAsFailed($e->getMessage());

            return [
                'status' => 'error',
                'entity_type' => $entityType,
                'uuid' => $uuid,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Prepare data for database insertion
     */
    private function prepareData(array $data, $user, bool $isCreate = true): array
    {
        // Remove non-fillable fields
        $prepared = array_filter($data, function ($key) {
            return !in_array($key, ['id', 'created_at', 'updated_at', 'deleted_at']);
        }, ARRAY_FILTER_USE_KEY);

        // Add user tracking
        if ($isCreate) {
            $prepared['created_by'] = $user->id;
        }
        $prepared['updated_by'] = $user->id;

        return $prepared;
    }

    /**
     * Get changes since timestamp
     */
    public function changes(Request $request)
    {
        $validated = $request->validate([
            'since' => 'required|date',
            'entities' => 'sometimes|array',
            'entities.*' => 'in:suppliers,products,rates,collections,payments',
        ]);

        $since = $validated['since'];
        $entities = $validated['entities'] ?? array_keys(self::ENTITY_MODELS);

        $changes = [];

        foreach ($entities as $entityType) {
            $modelClass = self::ENTITY_MODELS[$entityType];
            
            $changes[$entityType] = [
                'updated' => $modelClass::where('updated_at', '>', $since)->get(),
                'deleted' => $modelClass::onlyTrashed()
                    ->where('deleted_at', '>', $since)
                    ->get(['id', 'uuid', 'deleted_at']),
            ];
        }

        return $this->success([
            'changes' => $changes,
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
