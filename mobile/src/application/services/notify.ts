export type NotifyType = "success" | "error" | "info";

export interface Notification {
  message: string;
  type: NotifyType;
  channel?: string;
  data?: any;
}

type Listener = (n: Notification) => void;

const listeners: Listener[] = [];

export function subscribe(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function emit(
  message: string,
  type: NotifyType = "info",
  channel?: string,
  data?: any
) {
  const n = { message, type, channel, data } as Notification;
  for (const l of listeners) {
    try {
      l(n);
    } catch {}
  }
}
