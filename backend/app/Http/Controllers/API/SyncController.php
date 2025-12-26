<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\SyncOperation;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\ProductRate;
use App\Models\Collection;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SyncController extends Controller
{
    /**
     * Sync batch operations from offline device
     * 
     * @OA\Post(
     *     path="/api/sync",
     *     tags={"Sync"},
     *     summary="Sync offline operations",
     *     description="Batch sync operations with conflict detection and resolution",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"device_id","operations"},
     *             @OA\Property(property="device_id", type="string"),
     *             @OA\Property(property="operations", type="array", @OA\Items(
     *                 @OA\Property(property="local_id", type="string"),
     *                 @OA\Property(property="entity", type="string"),
     *                 @OA\Property(property="operation", type="string"),
     *                 @OA\Property(property="data", type="object"),
     *                 @OA\Property(property="timestamp", type="string")
     *             ))
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Sync completed",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="results", type="array", @OA\Items())
     *         )
     *     )
     * )
     */
    public function sync(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'device_id' => 'required|string',
            'operations' => 'required|array',
            'operations.*.local_id' => 'required|string',
            'operations.*.entity' => 'required|in:supplier,product,product_rate,collection,payment',
            'operations.*.operation' => 'required|in:create,update,delete',
            'operations.*.data' => 'required|array',
            'operations.*.timestamp' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $deviceId = $request->device_id;
        $operations = $request->operations;
        $results = [];

        foreach ($operations as $operation) {
            try {
                $result = DB::transaction(function () use ($operation, $deviceId, $request) {
                    return $this->processOperation(
                        $operation['entity'],
                        $operation['operation'],
                        $operation['data'],
                        $deviceId,
                        $operation['local_id'],
                        $operation['timestamp'],
                        $request->user()->id
                    );
                });

                $results[] = [
                    'local_id' => $operation['local_id'],
                    'status' => $result['status'],
                    'entity_id' => $result['entity_id'] ?? null,
                    'message' => $result['message'] ?? null,
                    'conflict_data' => $result['conflict_data'] ?? null,
                ];
            } catch (\Exception $e) {
                $results[] = [
                    'local_id' => $operation['local_id'],
                    'status' => 'error',
                    'message' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'results' => $results,
        ]);
    }

    /**
     * Process a single sync operation
     */
    private function processOperation(
        string $entity,
        string $operation,
        array $data,
        string $deviceId,
        string $localId,
        string $timestamp,
        int $userId
    ): array {
        // Add device_id and sync_metadata to data
        $data['device_id'] = $deviceId;
        $data['sync_metadata'] = [
            'synced_at' => now()->toISOString(),
            'original_timestamp' => $timestamp,
            'local_id' => $localId,
        ];

        // Get the model class
        $modelClass = $this->getModelClass($entity);
        
        switch ($operation) {
            case 'create':
                return $this->handleCreate($modelClass, $data, $userId);
            case 'update':
                return $this->handleUpdate($modelClass, $data, $userId);
            case 'delete':
                return $this->handleDelete($modelClass, $data, $userId);
            default:
                throw new \Exception("Unknown operation: $operation");
        }
    }

    /**
     * Handle create operation
     */
    private function handleCreate(string $modelClass, array $data, int $userId): array
    {
        // Add user_id if the model has it
        if (in_array('user_id', (new $modelClass)->getFillable())) {
            $data['user_id'] = $userId;
        }

        // Check for duplicate based on device_id and sync_metadata
        // Note: JSON contains queries can be slow on large datasets.
        // If duplicate detection becomes a performance bottleneck, consider:
        // 1. Adding a separate indexed column for local_id
        // 2. Using a composite unique index on (device_id, local_id)
        // 3. Implementing a caching layer for recent operations
        if (isset($data['sync_metadata']['local_id'])) {
            $existing = $modelClass::where('device_id', $data['device_id'])
                ->whereJsonContains('sync_metadata->local_id', $data['sync_metadata']['local_id'])
                ->first();

            if ($existing) {
                return [
                    'status' => 'duplicate',
                    'entity_id' => $existing->id,
                    'message' => 'Record already exists',
                ];
            }
        }

        $record = $modelClass::create($data);

        return [
            'status' => 'success',
            'entity_id' => $record->id,
        ];
    }

    /**
     * Handle update operation
     */
    private function handleUpdate(string $modelClass, array $data, int $userId): array
    {
        if (!isset($data['id'])) {
            throw new \Exception('ID is required for update operation');
        }

        $record = $modelClass::find($data['id']);

        if (!$record) {
            return [
                'status' => 'not_found',
                'message' => 'Record not found',
            ];
        }

        // Check for version conflict
        if (isset($data['version']) && $record->version != $data['version']) {
            return [
                'status' => 'conflict',
                'message' => 'Version conflict detected',
                'conflict_data' => [
                    'client_version' => $data['version'],
                    'server_version' => $record->version,
                    'server_data' => $record->toArray(),
                    'client_data' => $data,
                ],
            ];
        }

        // Increment version
        $data['version'] = $record->version + 1;

        // Update user_id if applicable
        if (in_array('user_id', $record->getFillable())) {
            $data['user_id'] = $userId;
        }

        $record->update($data);

        return [
            'status' => 'success',
            'entity_id' => $record->id,
        ];
    }

    /**
     * Handle delete operation
     */
    private function handleDelete(string $modelClass, array $data, int $userId): array
    {
        if (!isset($data['id'])) {
            throw new \Exception('ID is required for delete operation');
        }

        $record = $modelClass::find($data['id']);

        if (!$record) {
            return [
                'status' => 'not_found',
                'message' => 'Record not found',
            ];
        }

        // Check for version conflict
        if (isset($data['version']) && $record->version != $data['version']) {
            return [
                'status' => 'conflict',
                'message' => 'Version conflict detected',
                'conflict_data' => [
                    'client_version' => $data['version'],
                    'server_version' => $record->version,
                    'server_data' => $record->toArray(),
                ],
            ];
        }

        $record->delete();

        return [
            'status' => 'success',
            'entity_id' => $record->id,
        ];
    }

    /**
     * Get model class from entity name
     */
    private function getModelClass(string $entity): string
    {
        $modelMap = [
            'supplier' => Supplier::class,
            'product' => Product::class,
            'product_rate' => ProductRate::class,
            'collection' => Collection::class,
            'payment' => Payment::class,
        ];

        if (!isset($modelMap[$entity])) {
            throw new \Exception("Unknown entity: $entity");
        }

        return $modelMap[$entity];
    }

    /**
     * Get pending operations for a device
     */
    public function getPendingOperations(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'device_id' => 'required|string',
            'since' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $query = SyncOperation::where('device_id', $request->device_id)
            ->where('status', 'pending');

        if ($request->has('since')) {
            $query->where('created_at', '>', $request->since);
        }

        $operations = $query->orderBy('created_at')->get();

        return response()->json([
            'success' => true,
            'operations' => $operations,
        ]);
    }
}
