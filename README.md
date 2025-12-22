# KV (offline-first collection + payments)

This repo contains:

- `backend/`: Laravel API (Sanctum auth + sync/change feed)
- `mobile/`: Expo React Native app (offline SQLite + outbox + sync)

## Backend (Laravel)

### Prereqs

- PHP 8.3+
- Composer

### Setup

From repo root:

```bash
cd backend
composer install
php artisan migrate --seed
php artisan serve
```

API base (dev): `http://127.0.0.1:8000/api/v1`

Default seeded user:

- Email: `test@example.com`
- Password: `password`

## Mobile (Expo)

### Prereqs

- Node.js + npm
- Expo CLI (via `npx expo`)

### Setup

```bash
cd mobile
npm install
npm start
```

### API URL

The mobile app reads the API base URL from `mobile/src/config.ts`.

Default is Android emulator host mapping:

- `http://10.0.2.2:8000/api/v1`

If you run on a real device, change it to your machine LAN IP (e.g. `http://192.168.1.10:8000/api/v1`).

## Minimal usage flow

1. Start the backend (`php artisan serve`).
2. Start the mobile app (`npm start`) and open it in an emulator.
3. Log in using the seeded credentials.
4. Tap "Sync now" to pull products/units/rates seeded on the server.
5. Add suppliers/collections/payments offline; sync later.

## Notes

- Collections and payments are created offline-first and queued in the local outbox.
- Sync pushes outbox ops to `/sync` and pulls server change feed via `change_logs` cursoring.
