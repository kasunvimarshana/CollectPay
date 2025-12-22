import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { User } from "../../domain/models/User";
import { SQLiteUserRepository } from "../../infrastructure/persistence/sqlite/SQLiteUserRepository";
import { SyncService } from "../../infrastructure/sync/SyncService";
import { MySQLSyncProvider } from "../../infrastructure/sync/providers/MySQLSyncProvider";
import { registerBackgroundSync } from "../../infrastructure/sync/BackgroundTasks";

const repo = new SQLiteUserRepository();
const sync = new SyncService();

export type Action =
  | { type: "init"; users: User[] }
  | { type: "create"; user: User }
  | { type: "update"; user: User }
  | { type: "delete"; id: string };

type State = { users: User[] };

const initialState: State = { users: [] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "init":
      return { users: action.users };
    case "create":
      return { users: [action.user, ...state.users] };
    case "update":
      return { users: state.users.map((u) => (u.id === action.user.id ? action.user : u)) };
    case "delete":
      return { users: state.users.filter((u) => u.id !== action.id) };
    default:
      return state;
  }
}

const StoreContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      await repo.init();
      const users = await repo.list();
      dispatch({ type: "init", users });
      await registerBackgroundSync();
    })();
  }, []);

  // Attempt background sync on app resume and periodic interval if online.
  useEffect(() => {
    const provider = new MySQLSyncProvider(); // will throw if used
    const interval = setInterval(async () => {
      try {
        const online = await sync.isOnline();
        if (online) {
          await sync.processQueue(provider);
        }
      } catch (e) {
        // swallow: provider not available; offline-only still works
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("StoreProvider missing");
  return ctx;
}

export async function createUser(user: User) {
  await repo.create(user);
}
export async function updateUser(user: User) {
  await repo.update(user);
}
export async function deleteUser(id: string) {
  await repo.delete(id);
}
