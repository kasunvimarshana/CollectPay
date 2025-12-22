import { syncOnce } from "./sync";

// Call this from a screen / dev button later.
export async function syncSmokeTest(): Promise<void> {
  const result = await syncOnce({
    pushLimit: 50,
    conflictStrategy: "server_wins",
  });
  // eslint-disable-next-line no-console
  console.log("syncSmokeTest", result);
}
