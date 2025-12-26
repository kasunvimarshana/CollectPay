<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SyncBatchRequest;
use App\Services\SyncService;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SyncController extends Controller
{
    private SyncService $syncService;
    private AuditService $auditService;

    public function __construct(SyncService $syncService, AuditService $auditService)
    {
        $this->syncService = $syncService;
        $this->auditService = $auditService;
    }

    /**
     * Process sync batch from client
     */
    public function sync(SyncBatchRequest $request)
    {
        try {
            $results = $this->syncService->processSyncBatch(
                $request->sync_data,
                $request->user(),
                $request->device_id
            );

            return response()->json([
                'status' => 'success',
                'results' => $results,
                'server_timestamp' => now()->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            Log::error('Sync failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Sync failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get changes since last sync
     */
    public function pullChanges(Request $request)
    {
        $request->validate([
            'since' => 'required|date',
        ]);

        try {
            $changes = $this->syncService->getChangesSince(
                $request->since,
                $request->user()
            );

            return response()->json([
                'status' => 'success',
                'changes' => $changes,
                'server_timestamp' => now()->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            Log::error('Pull changes failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to pull changes: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get full sync data (for initial sync or recovery)
     */
    public function fullSync(Request $request)
    {
        try {
            $data = $this->syncService->getFullSyncData($request->user());

            return response()->json([
                'status' => 'success',
                'data' => $data,
                'server_timestamp' => now()->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            Log::error('Full sync failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Full sync failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check sync status
     */
    public function status(Request $request)
    {
        return response()->json([
            'status' => 'online',
            'server_time' => now()->toIso8601String(),
            'user_id' => $request->user()->id,
        ]);
    }
}
