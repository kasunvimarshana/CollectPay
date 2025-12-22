export class EventBus<Events extends Record<string, any>> {
  private listeners = new Map<keyof Events, Set<(payload: any) => void>>();

  on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler as any);
    return () => this.off(event, handler as any);
  }

  off<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void) {
    this.listeners.get(event)?.delete(handler as any);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    this.listeners.get(event)?.forEach(h => h(payload));
  }
}
