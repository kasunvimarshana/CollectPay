<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Str;

class SyncController extends Controller
{
    public function pull(Request $request)
    {
        $since = $request->query('since');
        $q = User::query();
        if ($since) {
            // Basic incremental token: updated_at ISO string
            $q->where('updated_at', '>', $since);
        }
        $rows = $q->get();
        $token = optional(User::query()->orderByDesc('updated_at')->first())->updated_at?->toISOString() ?? $since;
        return response()->json(['users' => $rows, 'token' => $token]);
    }

    public function push(Request $request)
    {
        $data = $request->validate([
            'op' => 'required|in:create,update,delete',
            'table' => 'required|in:users',
            'id' => 'nullable|string',
            'payload' => 'nullable|array',
            'version' => 'nullable|integer'
        ]);

        if ($data['table'] !== 'users') {
            return response()->json(['message' => 'Unknown table'], 400);
        }

        if ($data['op'] === 'create') {
            $payload = $data['payload'] ?? [];
            $user = new User();
            $user->id = $data['id'] ?? ($payload['id'] ?? (string) Str::uuid());
            $user->name = $payload['name'] ?? '';
            $user->email = $payload['email'] ?? '';
            $user->role = $payload['role'] ?? 'user';
            $user->attributes = $payload['attributes'] ?? null;
            $user->version = 0;
            $user->save();
            return response()->json(['ok' => true]);
        }

        $user = User::find($data['id'] ?? ($data['payload']['id'] ?? null));
        if (!$user) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($data['op'] === 'update') {
            if (array_key_exists('version', $data) && $data['version'] !== $user->version) {
                return response()->json(['ok' => false, 'conflict' => $user], 409);
            }
            $payload = $data['payload'] ?? [];
            $user->fill(collect($payload)->only(['name','email','role','attributes'])->toArray());
            $user->version = $user->version + 1;
            $user->save();
            return response()->json(['ok' => true]);
        }

        if ($data['op'] === 'delete') {
            $user->delete();
            return response()->json(['ok' => true]);
        }

        return response()->json(['message' => 'Unsupported op'], 400);
    }
}
