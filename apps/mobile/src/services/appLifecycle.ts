import { AppState } from "react-native";
import { syncOnce, startSyncLoop } from "./sync";
import { startRealtime } from "./events";

let started = false;

export function startAppLifecycleSync() {
  if (started) return;
  started = true;
  startRealtime();
  startSyncLoop();
  const sub = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      syncOnce().catch(() => {});
    }
  });
  return () => {
    sub.remove();
  };
}
