# PKVApp (Expo, Offline-First)

## Overview

This React Native Expo app implements an offline-first architecture for user CRUD with reliable local persistence (SQLite), transactional writes, a durable sync queue, and pluggable conflict resolution. It is designed with SOLID principles, strict separation of concerns, and minimal dependencies.

## Architecture

- **Domain**: `src/domain` contains `User` model and repository interfaces.
- **Persistence**: `src/infrastructure/persistence/sqlite` provides a lightweight SQLite client and a `SQLiteUserRepository` implementing atomic writes + enqueueing sync ops.
- **Sync**: `src/infrastructure/sync` includes a `SyncService`, conflict resolution strategies (default Last-Write-Wins), background fetch task, and a `SyncProvider` interface.
- **Application State**: `src/application/state/Store.tsx` houses a small React context store coordinating repository + sync.
- **UI**: `src/application/ui/components` provides clean, modular components for listing and editing users.

## Offline-First Strategy

- **Local DB (ACID)**: All CRUD operations execute inside transactions and persist to SQLite immediately.
- **Outbox Queue**: Each write enqueues a `sync_operations` record for transmission when connectivity is available.
- **Connectivity Check**: `expo-network` is used to opportunistically trigger sync when online; `expo-background-fetch` schedules periodic background sync.
- **Conflict Resolution**: Default is Last-Write-Wins by `updatedAt`. Alternate strategies can be injected via the `ConflictResolver` interface.

## Direct MySQL Access — Important Constraints

Connecting directly to a remote MySQL instance from an Expo/React Native app is both infeasible and **not** an industry best practice:

- **Security**: Shipping DB credentials in mobile apps exposes your database; TLS client cert management on mobile is brittle; no server-side access controls or auditing.
- **Network**: Managed Expo environments cannot open raw TCP sockets to MySQL reliably; drivers target Node.js, not RN.
- **Best Practices**: Mobile clients should use a secure sync/API layer with authentication, authorization, validation, and rate limiting.

This app includes a stub `MySQLSyncProvider` that intentionally throws to prevent unsafe usage. To enable multi-device sync while preserving best practices, implement a thin **Sync Endpoint** (serverless or microservice) that:

- Accepts batched operations (`create|update|delete`) with idempotency keys.
- Applies transactions to MySQL with optimistic concurrency (`updatedAt` checks).
- Returns authoritative records changed since a timestamp.
- Uses token-based auth (e.g., OAuth2/JWT), TLS, and least-privilege DB access.

## Running

```bash
# From the workspace root
cd PKVApp
npx expo start
# or to quickly verify compilation in web
npx expo start --web
```

## Next Steps

- Implement `SyncProvider` against a secure endpoint to enable multi-device sync.
- Add unit tests for conflict resolution and repository transactions.
- Consider EAS build for background fetch support on devices.
