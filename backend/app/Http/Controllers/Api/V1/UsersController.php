<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsersController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->authorizeResource(User::class, 'user');
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return User::query()->orderBy('name')->paginate(50);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'roles' => 'array',
            'roles.*' => 'string|exists:roles,name',
            'attributes' => 'array',
        ]);
        $user = new User();
        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->password = Hash::make($data['password']);
        if (isset($data['attributes'])) {
            $user->attributes = $data['attributes'];
        }
        $user->save();
        if (!empty($data['roles'])) {
            $roleIds = Role::whereIn('name', $data['roles'])->pluck('id');
            $user->roles()->sync($roleIds);
        }
        return response()->json($user, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return $user;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => 'sometimes|string|min:8',
            'roles' => 'array',
            'roles.*' => 'string|exists:roles,name',
            'attributes' => 'array',
        ]);
        if (isset($data['name'])) $user->name = $data['name'];
        if (isset($data['email'])) $user->email = $data['email'];
        if (isset($data['password'])) $user->password = Hash::make($data['password']);
        if (isset($data['attributes'])) $user->attributes = $data['attributes'];
        $user->save();
        if (isset($data['roles'])) {
            $roleIds = Role::whereIn('name', $data['roles'])->pluck('id');
            $user->roles()->sync($roleIds);
        }
        return $user;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();
        return response()->noContent();
    }
}
