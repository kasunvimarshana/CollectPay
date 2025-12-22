# KV Monorepo

Offline-first mobile app (Expo) with Laravel API backend and Socket.IO real-time sync.

## Structure

- apps/mobile: React Native Expo app
- apps/server: Laravel backend blueprint + Socket.IO server

## Quick Start (Windows / PowerShell)

1. Socket.IO server

```powershell
cd apps/server/socket
npm init -y
npm install express cors socket.io
node server.js
```

2. Laravel API

```powershell
cd apps/server
composer create-project laravel/laravel backend
cd backend
composer require laravel/sanctum
php artisan migrate
php artisan serve --host 0.0.0.0 --port 8000
```

Implement routes/controllers per apps/server/README.md.

3. Expo mobile app

```powershell
cd apps/mobile
npm init -y
npm install react react-native expo
npx expo install expo-router expo-sqlite expo-secure-store expo-network socket.io-client zustand
npm install -D typescript @types/react @types/react-native
npx expo start
```

4. Env config

- EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api
- EXPO_PUBLIC_SOCKET_URL=http://localhost:6001

## Architecture Goals

- SOLID, DRY, clear separation: domain, state, services, UI, events
- Offline-first: local SQLite, outbox, periodic + event-driven sync, conflict handling
- Minimal dependencies (all open-source, widely supported)
- RBAC/ABAC enforced server-side; client gates UI for UX
