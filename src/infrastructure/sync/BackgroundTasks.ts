import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import { SyncService } from "./SyncService";
import { MySQLSyncProvider } from "./providers/MySQLSyncProvider";

export const BACKGROUND_SYNC_TASK = "BACKGROUND_SYNC_TASK";

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    const sync = new SyncService();
    const online = await sync.isOnline();
    if (!online) return BackgroundFetch.BackgroundFetchResult.NoData;
    const provider = new MySQLSyncProvider();
    await sync.processQueue(provider);
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (e) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundSync() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 15 * 60, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (e) {
    // ignore if not supported in dev
  }
}
