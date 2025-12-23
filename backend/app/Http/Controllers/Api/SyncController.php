<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\ProductRate;
use App\Models\Payment;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SyncController extends Controller
{
    /**
     * Push local changes to server
     * 
     * Note: For production deployments with large sync operations,
     * consider implementing batch processing or breaking down large
     * sync operations into smaller transactions to avoid long-running
     * database transactions that may cause locking issues.
     */
    public function push(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'changes' => 'required|array',
            'changes.*.entity_type' => 'required|in:suppliers,products,rates,payments',
            'changes.*.operation' => 'required|in:create,update,delete',
            'changes.*.data' => 'required|array',
            'changes.*.client_timestamp' => 'required|date',
            'changes.*.client_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $results = [];
        $conflicts = [];

        // TODO: For production, implement batch size limits (e.g., max 50-100 items per sync)
        // and queue large sync operations for background processing
        DB::beginTransaction();
        try {
            foreach ($request->changes as $change) {
                $result = $this->processChange($change, $request->user());
                
                if ($result['status'] === 'conflict') {
                    $conflicts[] = $result;
                } else {
                    $results[] = $result;
                }
            }

            if (empty($conflicts)) {
                DB::commit();
                return response()->json([
                    'success' => true,
                    'data' => [
                        'synced' => count($results),
                        'conflicts' => count($conflicts),
                        'results' => $results,
                    ],
                    'message' => 'Changes synchronized successfully',
                ]);
            } else {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'data' => [
                        'synced' => 0,
                        'conflicts' => count($conflicts),
                        'conflicts_details' => $conflicts,
                    ],
                    'message' => 'Conflicts detected, no changes applied',
                ], 409);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Synchronization failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Pull server changes since last sync
     */
    public function pull(Request $request): JsonResponse
    {
        $since = $request->query('since');
        
        $changes = [
            'suppliers' => [],
            'products' => [],
            'rates' => [],
            'payments' => [],
        ];

        try {
            // Get suppliers
            $suppliersQuery = Supplier::with(['creator', 'updater']);
            if ($since) {
                $suppliersQuery->where('updated_at', '>', $since);
            }
            $changes['suppliers'] = $suppliersQuery->get();

            // Get products
            $productsQuery = Product::with(['supplier', 'creator', 'updater']);
            if ($since) {
                $productsQuery->where('updated_at', '>', $since);
            }
            $changes['products'] = $productsQuery->get();

            // Get rates
            $ratesQuery = ProductRate::with(['product', 'creator', 'updater']);
            if ($since) {
                $ratesQuery->where('updated_at', '>', $since);
            }
            $changes['rates'] = $ratesQuery->get();

            // Get payments
            $paymentsQuery = Payment::with(['supplier', 'product', 'creator', 'updater']);
            if ($since) {
                $paymentsQuery->where('updated_at', '>', $since);
            }
            $changes['payments'] = $paymentsQuery->get();

            return response()->json([
                'success' => true,
                'data' => $changes,
                'timestamp' => now()->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to pull changes: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Process a single change
     */
    private function processChange(array $change, $user): array
    {
        $entityType = $change['entity_type'];
        $operation = $change['operation'];
        $data = $change['data'];

        $model = $this->getModel($entityType);
        
        if (!$model) {
            return [
                'status' => 'error',
                'message' => 'Invalid entity type',
                'change' => $change,
            ];
        }

        try {
            switch ($operation) {
                case 'create':
                    return $this->handleCreate($model, $data, $user, $change);
                case 'update':
                    return $this->handleUpdate($model, $data, $user, $change);
                case 'delete':
                    return $this->handleDelete($model, $data, $user, $change);
                default:
                    return [
                        'status' => 'error',
                        'message' => 'Invalid operation',
                        'change' => $change,
                    ];
            }
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'change' => $change,
            ];
        }
    }

    private function handleCreate($model, $data, $user, $change): array
    {
        $data['created_by'] = $user->id;
        $data['version'] = 1;
        
        $entity = $model::create($data);

        // Log transaction
        Transaction::create([
            'entity_type' => $change['entity_type'],
            'entity_id' => $entity->id,
            'user_id' => $user->id,
            'action' => 'sync_create',
            'data_after' => $entity->toArray(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return [
            'status' => 'success',
            'operation' => 'create',
            'entity_type' => $change['entity_type'],
            'entity_id' => $entity->id,
            'client_id' => $change['client_id'] ?? null,
        ];
    }

    private function handleUpdate($model, $data, $user, $change): array
    {
        $entity = $model::find($data['id']);

        if (!$entity) {
            return [
                'status' => 'conflict',
                'conflict_type' => 'not_found',
                'message' => 'Entity not found on server',
                'change' => $change,
            ];
        }

        // Check for version conflict
        // Require version field for updates to ensure conflict detection works
        if (!isset($data['version'])) {
            return [
                'status' => 'error',
                'message' => 'Version field is required for updates',
                'change' => $change,
            ];
        }

        if ($entity->version > $data['version']) {
            return [
                'status' => 'conflict',
                'conflict_type' => 'version_mismatch',
                'message' => 'Version conflict detected',
                'server_data' => $entity->toArray(),
                'client_data' => $data,
                'change' => $change,
            ];
        }

        $before = $entity->toArray();
        $data['updated_by'] = $user->id;
        $data['version'] = $entity->version + 1;
        
        $entity->update($data);

        // Log transaction
        Transaction::create([
            'entity_type' => $change['entity_type'],
            'entity_id' => $entity->id,
            'user_id' => $user->id,
            'action' => 'sync_update',
            'data_before' => $before,
            'data_after' => $entity->fresh()->toArray(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return [
            'status' => 'success',
            'operation' => 'update',
            'entity_type' => $change['entity_type'],
            'entity_id' => $entity->id,
        ];
    }

    private function handleDelete($model, $data, $user, $change): array
    {
        $entity = $model::find($data['id']);

        if (!$entity) {
            return [
                'status' => 'success',
                'operation' => 'delete',
                'message' => 'Entity already deleted',
                'entity_type' => $change['entity_type'],
                'entity_id' => $data['id'],
            ];
        }

        $before = $entity->toArray();

        // Log transaction
        Transaction::create([
            'entity_type' => $change['entity_type'],
            'entity_id' => $entity->id,
            'user_id' => $user->id,
            'action' => 'sync_delete',
            'data_before' => $before,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        $entity->delete();

        return [
            'status' => 'success',
            'operation' => 'delete',
            'entity_type' => $change['entity_type'],
            'entity_id' => $entity->id,
        ];
    }

    private function getModel(string $entityType)
    {
        $models = [
            'suppliers' => Supplier::class,
            'products' => Product::class,
            'rates' => ProductRate::class,
            'payments' => Payment::class,
        ];

        return $models[$entityType] ?? null;
    }
}
