import io, { Socket } from "socket.io-client";
import { CONFIG } from "../config";
import { db } from "../../infrastructure/db/sqlite";

export class RealtimeClient {
  private socket: Socket | null = null;

  connect(): void {
    if (this.socket) return;
    this.socket = io(CONFIG.socketUrl, {
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {
      // Subscribe handlers for broadcast channels
      this.socket?.on("collections", (payload: any) => {
        const c = payload;
        db.transaction((tx: any) => {
          tx.executeSql(
            `INSERT OR REPLACE INTO collections 
            (id, supplierId, productId, quantity, unit, collectedAt, notes, synced)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
            [
              c.id,
              c.supplier_id,
              c.product_id,
              c.quantity,
              c.unit,
              c.collected_at,
              c.notes ?? null,
            ]
          );
        });
      });

      this.socket?.on("payments", (payload: any) => {
        const p = payload;
        db.transaction((tx: any) => {
          tx.executeSql(
            `INSERT OR REPLACE INTO payments 
            (id, supplierId, amount, currency, type, reference, paidAt, synced)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
            [
              p.id,
              p.supplier_id,
              p.amount,
              p.currency,
              p.type,
              p.reference ?? null,
              p.paid_at,
            ]
          );
        });
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
