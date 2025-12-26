<?php

namespace App\Http\Controllers\Api;

use App\Application\Sync\Services\SyncService;
use App\Application\Sync\DTOs\SyncRequestDTO;
use Illuminate\Http\Request;

class SyncController extends ApiController
{
    public function __construct(
        protected SyncService $syncService
    ) {}

    /**
     * Push changes from client to server
     */
    public function push(Request $request)
    {
        $validated = $request->validate([
            'device_id' => ['required', 'string', 'max:255'],
            'last_sync_token' => ['nullable', 'string'],
            'last_sync_at' => ['nullable', 'date'],
            'changes' => ['required', 'array'],
            'changes.*' => ['array'],
            'checksum' => ['nullable', 'string'],
        ]);

        $syncRequest = SyncRequestDTO::fromRequest($validated);
        $user = $request->user();

        $response = $this->syncService->processSync(
            $syncRequest,
            $user->id,
            $validated['device_id']
        );

        if ($response->success) {
            return $this->success($response->toArray(), 'Sync completed');
        }

        return $this->error('Sync failed', 422, $response->toArray());
    }

    /**
     * Pull changes from server to client
     */
    public function pull(Request $request)
    {
        $validated = $request->validate([
            'device_id' => ['required', 'string', 'max:255'],
            'last_sync_token' => ['nullable', 'string'],
            'last_sync_at' => ['nullable', 'date'],
            'entities' => ['nullable', 'array'],
        ]);

        $user = $request->user();

        $changes = $this->syncService->getServerChanges(
            $user->id,
            $validated['device_id'],
            $validated['last_sync_token'] ?? null,
            $validated['last_sync_at'] ?? null
        );

        return $this->success([
            'changes' => $changes,
            'sync_token' => \Illuminate\Support\Str::uuid()->toString(),
            'server_time' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get sync status for device
     */
    public function status(Request $request)
    {
        $validated = $request->validate([
            'device_id' => ['required', 'string', 'max:255'],
        ]);

        $user = $request->user();

        $states = \Illuminate\Support\Facades\DB::table('sync_states')
            ->where('user_id', $user->id)
            ->where('device_id', $validated['device_id'])
            ->get()
            ->keyBy('entity_type');

        $pendingCounts = [];
        $entityMap = [
            'suppliers' => \App\Domain\Supplier\Models\Supplier::class,
            'products' => \App\Domain\Product\Models\Product::class,
            'collections' => \App\Domain\Collection\Models\Collection::class,
            'payments' => \App\Domain\Payment\Models\Payment::class,
        ];

        foreach ($entityMap as $entity => $model) {
            $lastSync = $states[$entity]->last_sync_at ?? null;
            
            $pendingCounts[$entity] = $model::when($lastSync, function ($q) use ($lastSync) {
                return $q->where('updated_at', '>', $lastSync);
            })->count();
        }

        return $this->success([
            'states' => $states,
            'pending_changes' => $pendingCounts,
        ]);
    }

    /**
     * Generate checksum for sync payload
     */
    public function checksum(Request $request)
    {
        $validated = $request->validate([
            'data' => ['required', 'array'],
        ]);

        $checksum = $this->syncService->calculateChecksum($validated['data']);

        return $this->success(['checksum' => $checksum]);
    }
}
