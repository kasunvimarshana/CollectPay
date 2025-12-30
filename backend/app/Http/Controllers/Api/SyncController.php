<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Infrastructure\Sync\SyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Sync Controller
 *
 * Handles synchronization requests from mobile devices.
 * Supports offline-first architecture with conflict resolution.
 */
class SyncController extends Controller
{
    private SyncService $syncService;

    public function __construct(SyncService $syncService)
    {
        $this->syncService = $syncService;
    }

    /**
     * Sync data from mobile device to server
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function sync(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'suppliers' => 'nullable|array',
            'suppliers.*.name' => 'required|string|max:255',
            'suppliers.*.code' => 'nullable|string|max:50',
            'suppliers.*.version' => 'nullable|integer',
            'suppliers.*.local_id' => 'nullable|string',
            'suppliers.*.id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $userId = auth()->id();
            $suppliers = $request->get('suppliers', []);

            // Sync suppliers
            $results = [];
            if (! empty($suppliers)) {
                $results['suppliers'] = $this->syncService->syncSuppliers($suppliers, $userId);
            }

            return response()->json([
                'success' => true,
                'message' => 'Sync completed',
                'data' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sync failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get changes since last sync
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getChanges(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'last_synced_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $userId = auth()->id();
            $lastSyncedAt = $request->get('last_synced_at');

            $changes = $this->syncService->getChangesSinceLastSync($userId, $lastSyncedAt);

            return response()->json([
                'success' => true,
                'data' => $changes,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get changes',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Resolve a sync conflict
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function resolveConflict(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'entity_type' => 'required|string|in:supplier,product,collection,payment',
            'server_id' => 'required|integer',
            'client_data' => 'required|array',
            'strategy' => 'required|string|in:server_wins,client_wins,merge',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $userId = auth()->id();
            $entityType = $request->entity_type;
            $serverId = $request->server_id;
            $clientData = $request->client_data;
            $strategy = $request->strategy;

            // Currently only supports supplier conflicts
            if ($entityType === 'supplier') {
                $result = $this->syncService->resolveConflict($serverId, $clientData, $strategy, $userId);

                return response()->json([
                    'success' => true,
                    'message' => 'Conflict resolved',
                    'data' => $result,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Entity type not yet supported for conflict resolution',
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to resolve conflict',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check sync status
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function status()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'server_time' => now()->toISOString(),
                    'status' => 'online',
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
