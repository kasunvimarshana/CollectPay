import { useState, useEffect, useCallback } from "react";
import { syncService, SyncEvent, SyncResult } from "../services/sync";
import { SyncState } from "../domain/entities";

export function useSync() {
  const [state, setState] = useState<SyncState>(syncService.getState());
  const [lastEvent, setLastEvent] = useState<SyncEvent | null>(null);

  useEffect(() => {
    const unsubscribe = syncService.subscribe((event) => {
      setLastEvent(event);
      setState(syncService.getState());
    });

    return unsubscribe;
  }, []);

  const sync = useCallback(async (): Promise<SyncResult> => {
    return syncService.sync();
  }, []);

  const resolveConflict = useCallback(
    async (conflictIndex: number, resolution: "local" | "server") => {
      const conflict = state.conflicts[conflictIndex];
      if (conflict) {
        await syncService.resolveConflict(conflict, resolution);
        setState(syncService.getState());
      }
    },
    [state.conflicts]
  );

  return {
    ...state,
    lastEvent,
    sync,
    resolveConflict,
  };
}
