// Sync Context for managing synchronization state
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import SyncEngine from "../infrastructure/sync/SyncEngine";
import NetworkMonitor from "../infrastructure/network/NetworkMonitor";

const SyncContext = createContext(null);

export const SyncProvider = ({ children }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncStatus, setSyncStatus] = useState("idle"); // idle, syncing, success, error, offline
  const [pendingChanges, setPendingChanges] = useState(0);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    setupListeners();
    checkPendingChanges();

    return () => {
      SyncEngine.removeAllListeners("syncStarted");
      SyncEngine.removeAllListeners("syncCompleted");
      SyncEngine.removeAllListeners("syncFailed");
      NetworkMonitor.removeAllListeners("networkStateChanged");
    };
  }, []);

  const setupListeners = () => {
    // Sync events
    SyncEngine.on("syncStarted", ({ reason }) => {
      setIsSyncing(true);
      setSyncStatus("syncing");
      console.log(`Sync started: ${reason}`);
    });

    SyncEngine.on("syncCompleted", (result) => {
      setIsSyncing(false);
      setSyncStatus("success");
      setLastSyncTime(result.timestamp);
      setLastSyncResult(result);
      if (result.conflicts?.length > 0) {
        setConflicts(result.conflicts);
      }
      checkPendingChanges();
    });

    SyncEngine.on("syncFailed", ({ error }) => {
      setIsSyncing(false);
      setSyncStatus("error");
      console.error("Sync failed:", error);
    });

    // Network events
    NetworkMonitor.on("networkStateChanged", (isConnected) => {
      setIsOnline(isConnected);
      if (!isConnected) {
        setSyncStatus("offline");
      } else if (syncStatus === "offline") {
        setSyncStatus("idle");
      }
    });

    // Check initial network state
    setIsOnline(NetworkMonitor.getConnectionStatus());
  };

  const checkPendingChanges = useCallback(async () => {
    const count = await SyncEngine.getPendingCount();
    setPendingChanges(count);
  }, []);

  const triggerManualSync = useCallback(async () => {
    if (!isOnline) {
      return { status: "offline", message: "Cannot sync while offline" };
    }

    if (isSyncing) {
      return { status: "in_progress", message: "Sync already in progress" };
    }

    return await SyncEngine.triggerSync("manual");
  }, [isOnline, isSyncing]);

  const resolveConflict = useCallback(async (conflictId, resolution) => {
    await SyncEngine.resolveConflict(conflictId, resolution);
    setConflicts((prev) => prev.filter((c) => c.id !== conflictId));
  }, []);

  const clearConflicts = useCallback(() => {
    setConflicts([]);
  }, []);

  const value = {
    isSyncing,
    lastSyncTime,
    syncStatus,
    pendingChanges,
    isOnline,
    lastSyncResult,
    conflicts,
    triggerManualSync,
    resolveConflict,
    clearConflicts,
    checkPendingChanges,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSync must be used within a SyncProvider");
  }
  return context;
};

export default SyncContext;
