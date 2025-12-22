import io from "socket.io-client";
import { syncOnce } from "./sync";

let socket: ReturnType<typeof io> | undefined;

export function startRealtime() {
  if (socket) return;
  const url = process.env.EXPO_PUBLIC_SOCKET_URL || "http://localhost:6001";
  socket = io(url, { transports: ["websocket"] });
  socket.on("connect", () => {});
  socket.on("disconnect", () => {});
  // Listen for server-side domain events and trigger a pull
  ["users.created", "users.updated", "users.deleted"].forEach((evt) => {
    socket!.on(evt, async () => {
      await syncOnce();
    });
  });
}

export function stopRealtime() {
  socket?.disconnect();
  socket = undefined;
}
