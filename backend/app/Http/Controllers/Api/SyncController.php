<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SyncController extends Controller
{
    protected SyncService $service;

    public function __construct()
    {
        $this->service = new SyncService();
    }

    /**
     * Pull data from server (download).
     */
    public function pull(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'last_synced_at' => 'nullable|date',
            ]);

            $data = $this->service->pull(
                $request->user()->id,
                $request->header('X-Device-ID') ?? 'unknown',
                $validated['last_synced_at'] ?? null
            );

            return response()->json([
                'success' => true,
                'message' => 'Data pulled successfully',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Push local changes to server (upload).
     */
    public function push(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'operations' => 'required|array',
                'operations.*.operation' => 'required|in:create,update,delete,update_version,deactivate',
                'operations.*.entity_type' => 'required|in:collections,payments,rates',
                'operations.*.payload' => 'required|array',
                'operations.*.idempotency_key' => 'nullable|string',
            ]);

            $results = $this->service->push(
                $request->user()->id,
                $request->header('X-Device-ID') ?? 'unknown',
                $validated['operations']
            );

            return response()->json([
                'success' => true,
                'message' => 'Data pushed successfully',
                'results' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Resolve conflicts.
     */
    public function resolveConflicts(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'conflicts' => 'required|array',
                'conflicts.*.uuid' => 'required|string',
                'conflicts.*.entity_type' => 'required|in:collections,payments,rates',
                'conflicts.*.strategy' => 'required|in:server_wins,client_wins,merge',
                'conflicts.*.client_data' => 'nullable|array',
                'conflicts.*.merge_strategy' => 'nullable|string',
            ]);

            $results = $this->service->resolveConflicts(
                $request->user()->id,
                $request->header('X-Device-ID') ?? 'unknown',
                $validated['conflicts']
            );

            return response()->json([
                'success' => true,
                'message' => 'Conflicts resolved',
                'results' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get sync status.
     */
    public function status(Request $request): JsonResponse
    {
        try {
            $status = $this->service->getSyncStatus(
                $request->user()->id,
                $request->header('X-Device-ID') ?? 'unknown'
            );

            return response()->json([
                'success' => true,
                'data' => $status,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Retry failed sync operations.
     */
    public function retryFailed(Request $request): JsonResponse
    {
        try {
            $results = $this->service->retryFailed(
                $request->user()->id,
                $request->header('X-Device-ID') ?? 'unknown'
            );

            return response()->json([
                'success' => true,
                'message' => 'Failed operations marked for retry',
                'results' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
