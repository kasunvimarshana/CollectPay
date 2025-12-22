# KV Server (Laravel + Socket.IO)

Backend blueprint with Laravel API, JWT-style auth via Sanctum, RBAC/ABAC via roles+policies, and Socket.IO for real-time sync signals.

## Stack

- Laravel (API only)
- Sanctum (mobile token auth)
- Policies/Gates for RBAC & ABAC
- Socket.IO server (Node) for event broadcasting

## Bootstrap

```powershell
cd apps/server
composer create-project laravel/laravel backend
cd backend
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\\Sanctum\\SanctumServiceProvider"
php artisan migrate
```

Enable Sanctum API token auth (config/sanctum.php) and add middleware to app/Http/Kernel.php (EnsureFrontendRequestsAreStateful not required for mobile token auth).

## Roles & Permissions

Create migrations and models:

- roles (id, name)
- permissions (id, name)
- role_user (role_id, user_id)
- permission_role (permission_id, role_id)
- Add JSON attributes column to users (department, region, etc.)

Seed roles: admin, manager, user. Example permission names: user.create, user.update, user.delete.

## Policies (RBAC + ABAC)

Create app/Policies/UserPolicy.php with checks combining roles and attributes (department, ownership):

```php
public function update(User $actor, User $target): bool {
    if ($actor->hasRole('admin')) return true;
    if ($actor->id === $target->id) return true; // ABAC: owner
    if ($actor->hasRole('manager')) {
        return ($actor->attributes['department'] ?? null)
            === ($target->attributes['department'] ?? null);
    }
    return false;
}
```

Register policies in AuthServiceProvider.

## Auth Endpoints

- POST /api/auth/login → issues token: { token, user }
- GET /api/auth/me → returns current user (with roles, attributes)

Use Sanctum createToken('device') to generate token.

## Users CRUD

- GET /api/users
- POST /api/users
- PUT /api/users/{id} (use optimistic concurrency: accept version, return 409 on mismatch)
- DELETE /api/users/{id} (soft delete)

Maintain columns: version (int), updated_at, deleted_at.

## Sync API

- GET /api/sync?since={token} → returns changes since token and next token
- POST /api/sync body: { op, table, id, payload, version }
  - On conflict, return 409 with { conflict: <serverRecord> }

Implement a change-log (e.g., changes table) or use updated_at + soft deletes and return a monotonic token (e.g., last updated_at or ULID cursor).

## Real-time Events (Socket.IO)

Use Node Socket.IO server at apps/server/socket/server.js. From Laravel, broadcast domain events by HTTP POST to the Socket server or via Redis pubsub.

Example in Laravel after saving a user:

```php
Http::post(env('SOCKET_EMIT_URL') . '/emit', [
  'event' => 'users.updated',
  'data' => [ 'id' => $user->id ]
]);
```

Configure SOCKET_EMIT_URL=http://localhost:6001.

## CORS & Security

- Set CORS in Laravel to allow mobile app origins (Expo dev URLs) for API.
- Enforce authorization at the server (policies) regardless of client UI gating.

## Run

```powershell
# Laravel
php artisan serve --host 0.0.0.0 --port 8000

# Socket.IO server
cd ..\socket
npm install
node server.js
```
