<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use App\Models\User;

class UsersController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);
        $users = User::query()->whereNull('deleted_at')->orderByDesc('updated_at')->get();
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $this->authorize('create', User::class);
        $data = $request->validate([
            'id' => 'nullable|string',
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:admin,manager,user',
            'attributes' => 'nullable',
        ]);

        $user = new User();
        $user->id = $data['id'] ?? (string) Str::uuid();
        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->role = $data['role'];
        $user->attributes = $data['attributes'] ?? null;
        $user->version = 0;
        $user->save();

        $this->emit('users.created', ['id' => $user->id]);
        return response()->json($user, 201);
    }

    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        $this->authorize('update', $user);
        $data = $request->validate([
            'name' => 'sometimes|required|string',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id . ',id',
            'role' => 'sometimes|required|in:admin,manager,user',
            'attributes' => 'nullable',
            'version' => 'nullable|integer',
        ]);

        if (array_key_exists('version', $data) && $data['version'] !== $user->version) {
            return response()->json($user, 409);
        }

        $user->fill(collect($data)->except(['version'])->toArray());
        $user->version = $user->version + 1;
        $user->save();

        $this->emit('users.updated', ['id' => $user->id]);
        return response()->json($user);
    }

    public function destroy(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        $this->authorize('delete', $user);
        $user->delete();
        $this->emit('users.deleted', ['id' => $user->id]);
        return response()->noContent();
    }

    private function emit(string $event, array $data = [])
    {
        $url = config('services.socket.emit_url', env('SOCKET_EMIT_URL'));
        if (!$url) return;
        try {
            Http::timeout(2)->post(rtrim($url, '/') . '/emit', [
                'event' => $event,
                'data' => $data,
            ]);
        } catch (\Throwable $e) {
            // swallow
        }
    }
}
