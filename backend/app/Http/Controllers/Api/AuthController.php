<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'device_id' => ['nullable', 'uuid'],
            'device_name' => ['nullable', 'string', 'max:255'],
            'platform' => ['nullable', 'string', 'max:64'],
        ]);

        if (!Auth::attempt(['email' => $validated['email'], 'password' => $validated['password']])) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        /** @var User $user */
        $user = $request->user();

        $deviceId = $validated['device_id'] ?? (string) Str::uuid();

        $device = Device::query()->whereKey($deviceId)->first();
        if ($device !== null && $device->user_id !== $user->id) {
            return response()->json(['message' => 'Device already registered to another user.'], 409);
        }

        Device::query()->updateOrCreate(
            ['id' => $deviceId],
            [
                'user_id' => $user->id,
                'device_name' => $validated['device_name'] ?? null,
                'platform' => $validated['platform'] ?? null,
                'last_seen_at' => now(),
            ]
        );

        $token = $user->createToken('mobile:' . $deviceId)->plainTextToken;

        return response()->json([
            'token' => $token,
            'device_id' => $deviceId,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();
        return response()->json(['ok' => true]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id' => $user?->id,
            'name' => $user?->name,
            'email' => $user?->email,
        ]);
    }
}
