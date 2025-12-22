# KV Mobile (Expo)

Offline-first React Native app (Expo) with local SQLite persistence, outbox-based sync, RBAC/ABAC guards, and real-time updates via Socket.IO.

## Stack

- Expo + React Native + TypeScript
- expo-router (navigation)
- expo-sqlite (local DB), expo-secure-store (token), expo-network (reachability)
- Zustand (state management)
- Socket.IO client (real-time)

## Setup

```powershell
cd apps/mobile
npm init -y
npm install react react-native expo
npx expo install expo-router expo-sqlite expo-secure-store expo-network socket.io-client zustand
npm install -D typescript @types/react @types/react-native
npx expo customize metro.config.js
```

Add env in `.env` or via app config:

- `EXPO_PUBLIC_API_BASE_URL` (e.g., <http://localhost:8000/api>)
- `EXPO_PUBLIC_SOCKET_URL` (e.g., <http://localhost:6001>)

Run:

```powershell
npx expo start
```

## Architecture

- `src/services/db.ts`: SQLite schema, read/write helpers
- `src/services/repository.ts`: repository + outbox + sync token
- `src/services/sync.ts`: push outbox, pull changes, conflict handling
- `src/services/auth.ts` + `src/state/authStore.ts`: JWT auth
- `src/security/accessControl.ts`: RBAC + ABAC checks (UI gating)
- `src/state/userStore.ts`: user CRUD using offline-first repo
- `src/services/events.ts`: Socket.IO triggers sync on domain events

## Notes

- Conflict strategy: server-wins by default; customize in `sync.ts`.
- Transactions: local mutations and outbox writes run in one SQLite transaction.
- Minimized deps: all libraries used are open-source and widely maintained.
