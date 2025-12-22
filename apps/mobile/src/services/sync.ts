import { api } from "./api";
import { outbox, syncState, userRepo } from "./repository";
import { isOnline } from "@/utils/net";
import { backoff } from "@/utils/retry";
import type { UserRecord } from "@/domain/User";

let syncing = false;
let intervalHandle: any;

export async function pushOutboxOnce() {
  if (!(await isOnline())) return;
  const batch = await outbox.nextBatch();
  for (const item of batch) {
    try {
      const payload = item.payload ? JSON.parse(item.payload) : undefined;
      const res = await api.pushChange({
        op: item.op,
        table: item.table_name,
        id: item.record_id,
        payload,
      });
      if (res.conflict) {
        // Simple conflict handler: prefer server, but keep local bump by re-applying local with new base if needed
        await userRepo.applyRemote(res.conflict as UserRecord);
      }
      await outbox.markProcessed(item.id);
    } catch (e) {
      await outbox.bumpAttempts(item.id);
      // Leave in outbox for retry
      break;
    }
  }
}

export async function pullOnce() {
  if (!(await isOnline())) return;
  const token = await syncState.getToken();
  const res = await api.pullChanges(token);
  for (const u of res.users) {
    await userRepo.applyRemote(u);
  }
  await syncState.setToken(res.token);
}

export async function syncOnce() {
  if (syncing) return;
  syncing = true;
  try {
    await pushOutboxOnce();
    await pullOnce();
  } finally {
    syncing = false;
  }
}

export function startSyncLoop() {
  if (intervalHandle) return;
  intervalHandle = setInterval(() => {
    backoff(() => syncOnce(), { baseMs: 3000, maxMs: 15000 }).catch(() => {});
  }, 5000);
}

export function stopSyncLoop() {
  if (intervalHandle) clearInterval(intervalHandle);
  intervalHandle = undefined;
}
