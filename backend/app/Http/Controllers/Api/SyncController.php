<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SyncController extends Controller
{
    private SyncService $syncService;

    public function __construct(SyncService $syncService)
    {
        $this->syncService = $syncService;
    }

    /**
     * Push local changes to server (bidirectional sync - push phase)
     */
    public function push(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'device_id' => 'required|string',
            'batch' => 'required|array',
            'batch.*.entity_type' => 'required|string|in:suppliers,products,rates,collections,payments',
            'batch.*.operation' => 'required|string|in:create,update,delete',
            'batch.*.data' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $userId = auth()->id();
        $deviceId = $request->device_id;
        $batch = $request->batch;

        try {
            $results = $this->syncService->processSyncBatch($batch, $userId, $deviceId);

            return response()->json([
                'success' => true,
                'message' => 'Sync push completed',
                'results' => $results,
                'summary' => [
                    'total' => count($batch),
                    'success' => count($results['success']),
                    'conflicts' => count($results['conflicts']),
                    'errors' => count($results['errors']),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sync push failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Pull server changes to local (bidirectional sync - pull phase)
     */
    public function pull(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'device_id' => 'required|string',
            'last_sync_at' => 'nullable|date',
            'entity_types' => 'required|array',
            'entity_types.*' => 'string|in:suppliers,products,rates,collections,payments',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $userId = auth()->id();
        $lastSyncAt = $request->last_sync_at;
        $entityTypes = $request->entity_types;

        try {
            $changes = [];
            
            foreach ($entityTypes as $entityType) {
                $changes[$entityType] = $this->syncService->getChangesSince(
                    $entityType,
                    $lastSyncAt,
                    $userId
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Sync pull completed',
                'changes' => $changes,
                'sync_timestamp' => now()->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sync pull failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Full bidirectional sync (push then pull)
     */
    public function sync(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'device_id' => 'required|string',
            'last_sync_at' => 'nullable|date',
            'batch' => 'nullable|array',
            'entity_types' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $userId = auth()->id();
        $deviceId = $request->device_id;
        
        try {
            // Phase 1: Push local changes
            $pushResults = null;
            if ($request->has('batch') && count($request->batch) > 0) {
                $pushResults = $this->syncService->processSyncBatch(
                    $request->batch,
                    $userId,
                    $deviceId
                );
            }

            // Phase 2: Pull server changes
            $changes = [];
            foreach ($request->entity_types as $entityType) {
                $changes[$entityType] = $this->syncService->getChangesSince(
                    $entityType,
                    $request->last_sync_at,
                    $userId
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Full sync completed',
                'push_results' => $pushResults,
                'pull_changes' => $changes,
                'sync_timestamp' => now()->toIso8601String(),
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
     * Get sync status
     */
    public function status(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'device_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'server_time' => now()->toIso8601String(),
            'status' => 'online',
        ]);
    }
}
