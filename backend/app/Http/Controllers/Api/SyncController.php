<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChangeLog;
use App\Models\Device;
use App\Services\Sync\SyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SyncController extends Controller
{
    public function sync(Request $request)
    {
        $validated = $request->validate([
            'device_id' => ['required', 'uuid'],
            'cursor' => ['nullable', 'integer', 'min:0'],
            'conflict_strategy' => ['nullable', 'in:server_wins,client_wins'],
            'ops' => ['nullable', 'array'],
            'ops.*.op_id' => ['required_with:ops', 'uuid'],
            'ops.*.entity' => ['required_with:ops', 'string'],
            'ops.*.type' => ['required_with:ops', 'in:upsert,delete'],
            'ops.*.id' => ['required_with:ops', 'uuid'],
            'ops.*.base_version' => ['nullable', 'integer'],
            'ops.*.payload' => ['nullable', 'array'],
            'ops.*.client_updated_at' => ['nullable', 'date'],
        ]);

        $user = $request->user();
        $deviceId = $validated['device_id'];
        $cursor = (int) ($validated['cursor'] ?? 0);
        $conflictStrategy = $validated['conflict_strategy'] ?? 'server_wins';

        $device = Device::query()->whereKey($deviceId)->first();
        if ($device !== null && $device->user_id !== $user->id) {
            return response()->json(['message' => 'Device already registered to another user.'], 409);
        }

        Device::query()->updateOrCreate(
            ['id' => $deviceId],
            [
                'user_id' => $user->id,
                'last_seen_at' => now(),
            ]
        );

        $service = new SyncService();
        $applied = [];
        $conflicts = [];

        foreach (($validated['ops'] ?? []) as $op) {
            $opId = (string) $op['op_id'];

            // Idempotency: if op_id already processed, skip.
            $already = DB::table('sync_ops')->where('op_id', $opId)->exists();
            if ($already) {
                $applied[] = ['status' => 'skipped', 'op_id' => $opId];
                continue;
            }

            $result = $service->applyOperation((int) $user->id, $deviceId, $op, $conflictStrategy);

            if (($result['status'] ?? null) !== 'conflict') {
                DB::table('sync_ops')->insert([
                    'op_id' => $opId,
                    'user_id' => $user->id,
                    'device_id' => $deviceId,
                    'entity' => (string) $op['entity'],
                    'type' => (string) $op['type'],
                    'entity_id' => (string) $op['id'],
                    'received_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $applied[] = ['op_id' => $opId, ...$result];
            if (($result['status'] ?? null) === 'conflict') {
                $conflicts[] = ['op_id' => $opId, ...$result];
            }
        }

        $changes = ChangeLog::query()
            ->where('id', '>', $cursor)
            ->orderBy('id')
            ->limit(500)
            ->get();

        $newCursor = $cursor;
        if ($changes->isNotEmpty()) {
            $newCursor = (int) $changes->last()->id;
        }

        Device::query()->whereKey($deviceId)->update([
            'last_pulled_seq' => $newCursor,
            'last_seen_at' => now(),
        ]);

        return response()->json([
            'device_id' => $deviceId,
            'applied' => $applied,
            'conflicts' => $conflicts,
            'pull' => [
                'cursor' => $newCursor,
                'changes' => $changes->map(fn ($c) => [
                    'seq' => (int) $c->id,
                    'model' => $c->model,
                    'model_id' => $c->model_id,
                    'operation' => $c->operation,
                    'version' => (int) $c->version,
                    'payload' => $c->payload,
                    'changed_at' => $c->changed_at?->toIso8601String(),
                ])->all(),
            ],
        ]);
    }
}
