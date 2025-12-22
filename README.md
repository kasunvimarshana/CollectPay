## OfflineKVApp – Offline‑First React Native with Firestore

This app demonstrates a clean, modular architecture that supports robust offline capability and multi‑device sync using Firebase Firestore directly (no custom API).

Key traits:

- Clean architecture layering (domain, data, services, store, UI)
- Offline‑first with Firestore local persistence and transactions
- Intelligent sync hints and optimistic concurrency via `version`
- User CRUD works offline and syncs when back online

## Architecture

- `src/domain`: entities, repository interfaces, use cases
- `src/data/firestore`: Firestore repository implementation and mappers
- `src/services`: `SyncService` for network/snapshots sync events
- `src/store`: Zustand store for UI‑level state
- `src/ui`: screens and navigation
- `src/config/firebase.ts`: initialization + persistence settings

## Prerequisites

- React Native environment set up for Android/iOS
- Firebase project with Firestore enabled

Android setup:

1. Download `google-services.json` from Firebase Console and place it at:
   `android/app/google-services.json`
2. Ensure the app package name matches `applicationId` in `android/app/build.gradle` (default `com.offlinekvapp`). Update Firebase config if you change it.

iOS setup (optional, if you plan to build for iOS):

1. Download `GoogleService-Info.plist` and add it to the Xcode project under the iOS app target.
2. Run `cd ios && pod install`.

## Install & Run

```bash
npm install
npm start
npm run android   # with an emulator or device connected
```

The banner at the top shows online/offline and basic sync status.

## Conflict resolution & transactions

- Each user document has a numeric `version`.
- Writes run inside Firestore transactions and bump `version` and `updatedAt`.
- Firestore’s offline queue ensures writes persist and sync later.
- If two devices edit the same record, the later write wins by version; customize strategies in `FirestoreUserRepository` if you prefer different merge logic.

## Folder Highlights

- `src/domain/usecases/user/*`: CRUD use cases
- `src/data/firestore/FirestoreUserRepository.ts`: direct Firestore access
- `src/services/SyncService.ts`: network + snapshots in‑sync events
- `src/ui/screens`: `UsersListScreen`, `UserFormScreen`

## Notes

- For production, secure Firestore via rules and add auth (email/anon/OAuth).
- You can replace Firestore with another direct DB (e.g., Realm Sync or CouchDB/PouchDB) by implementing `UserRepository` for that backend.
