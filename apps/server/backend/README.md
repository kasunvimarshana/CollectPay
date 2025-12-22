# Laravel Backend (Drop-in Skeleton)

This folder contains a minimal set of files (routes, controllers, models, policies, migrations) compatible with a fresh Laravel + Sanctum installation. It implements the API described in ../openapi.yaml.

## Usage

1. Create a new Laravel app in `apps/server`:

```powershell
cd apps/server
composer create-project laravel/laravel backend
```

2. Copy the contents of this `backend` folder into the generated Laravel app, overwriting when prompted:

```powershell
robocopy .\backend .\backend /E
```

(If you created the Laravel app in the same `backend` path, copy the subfolders/files appropriately. The goal is to place these into the Laravel root.)

3. Install Sanctum and run migrations:

```powershell
cd backend
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\\Sanctum\\SanctumServiceProvider"
REM Use sqlite for quick start
mkdir database 2>NUL
type NUL > database\database.sqlite
php artisan migrate
php artisan db:seed
```

4. Configure Socket emit URL:

- Set `SOCKET_EMIT_URL=http://localhost:6001` in `.env`.

5. Serve API:

```powershell
php artisan serve --host 0.0.0.0 --port 8000
```

## Notes

- Users table uses UUID primary key, JSON `attributes`, integer `version`, and soft deletes.
- Policies enforce RBAC (role) + ABAC (department ownership or self) and must be kept authoritative.
- Sync endpoints:
  - `GET /api/sync?since=` pulls changes (uses `updated_at` as a monotonic token).
  - `POST /api/sync` applies changes with conflict detection (409 returns server state).
- On create/update/delete, the server emits Socket.IO events via `SOCKET_EMIT_URL`.

### Migration conflicts

Laravel ships with default `users` table migrations (e.g., `2014_10_12_000000_create_users_table.php`). If present, delete or disable them so only this repo's migration creates the `users` table with UUID/attributes/version/soft-deletes. Otherwise, reset with:

```powershell
php artisan migrate:fresh --seed
```
