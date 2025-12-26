<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ValidateSyncPayload
{
    public function handle(Request $request, Closure $next)
    {
        // Validate device ID is present
        if (!$request->has('device_id') || empty($request->device_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Device ID is required for sync operations',
            ], 400);
        }

        // Validate payload checksum if provided
        if ($request->has('checksum') && $request->has('changes')) {
            $key = config('sync.payload_signing_key', config('app.key'));
            $calculatedChecksum = hash_hmac('sha256', json_encode($request->changes), $key);

            if (!hash_equals($request->checksum, $calculatedChecksum)) {
                Log::warning('Sync payload integrity check failed', [
                    'user_id' => $request->user()?->id,
                    'device_id' => $request->device_id,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Payload integrity check failed',
                ], 400);
            }
        }

        // Log sync request for audit
        if (config('sync.enable_sync_logging', true)) {
            Log::info('Sync request received', [
                'user_id' => $request->user()?->id,
                'device_id' => $request->device_id,
                'endpoint' => $request->path(),
                'changes_count' => $this->countChanges($request->changes ?? []),
            ]);
        }

        return $next($request);
    }

    protected function countChanges(array $changes): int
    {
        $count = 0;
        foreach ($changes as $entityChanges) {
            $count += count($entityChanges);
        }
        return $count;
    }
}
