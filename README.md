# PKV Data Collection & Payment Management

This repository contains a full-stack application with a Laravel backend and an Expo React Native frontend. It is designed with a clean, modular, and scalable architecture applying SOLID, DRY, and separation of concerns. It supports offline-first collection, robust payment management, RBAC/ABAC auth, and real-time updates via Socket.IO.

## Structure

- backend/ — Laravel API (to be initialized)
- mobile/ — Expo React Native app (initialized)
- socket-server/ — Node Socket.IO server bridging Redis broadcast to clients

## Prerequisites

- PHP 8.3+
- Composer
- Node.js 18+
- Redis (for broadcast)

## Backend Setup (Laravel)

1. Install PHP 8.3 via winget:
   ```powershell
   winget install --id=PHP.PHP.8.3 -e --source winget
   ```
2. Install Composer:
   ```powershell
   cd C:\projects\PKV\backend
   Invoke-WebRequest https://getcomposer.org/installer -OutFile composer-setup.php
   php composer-setup.php --install-dir=. --filename=composer.phar
   php composer.phar create-project laravel/laravel .
   ```
3. Install dependencies and packages:
   ```powershell
   php artisan key:generate
   php artisan vendor:publish
   ```
4. Configure .env (database, Redis):
   - QUEUE_CONNECTION=redis
   - BROADCAST_DRIVER=redis
   - REDIS_CLIENT=phpredis
   - SANCTUM_STATEFUL_DOMAINS=localhost

## Socket Server

```powershell
cd C:\projects\PKV\socket-server
npm start
```

Set `REDIS_URL` env var if needed.

## Mobile Setup (Expo)

```powershell
cd C:\projects\PKV\mobile
npm run android # or npm run web
```

## Architecture Overview

- Domain: suppliers, products, schedules, rates, collections, payments
- Application Services: transaction management, totals calculation, sync orchestration
- Infrastructure: Eloquent models, repositories, SQLite (mobile), Redis broadcast
- Auth: Laravel Sanctum tokens + gates/policies for RBAC/ABAC
- Real-time: Laravel events → Redis → Socket.IO → mobile

## Next Steps

- Initialize Laravel in `backend/` and implement migrations, policies, services, and REST API.
- Wire mobile app to backend API base URL and Socket.IO server.
- Add feature tests and end-to-end tests.
