// Repository for Payment operations
import Database from "../../infrastructure/database/Database";
import * as Crypto from "expo-crypto";

class PaymentRepository {
  async getAll(filters = {}) {
    let query = `
      SELECT p.*, s.name as supplier_name
      FROM payments p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.supplier_id) {
      query += " AND p.supplier_id = ?";
      params.push(filters.supplier_id);
    }

    if (filters.from_date) {
      query += " AND p.payment_date >= ?";
      params.push(filters.from_date);
    }

    if (filters.to_date) {
      query += " AND p.payment_date <= ?";
      params.push(filters.to_date);
    }

    if (filters.payment_type) {
      query += " AND p.payment_type = ?";
      params.push(filters.payment_type);
    }

    if (filters.payment_method) {
      query += " AND p.payment_method = ?";
      params.push(filters.payment_method);
    }

    query += " ORDER BY p.payment_date DESC, p.created_at DESC";

    return await Database.query(query, params);
  }

  async getById(id) {
    return await Database.queryFirst(
      `SELECT p.*, s.name as supplier_name
       FROM payments p
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.id = ?`,
      [id]
    );
  }

  async create(data) {
    const now = new Date().toISOString();

    // Generate UUID
    const paymentUuid = data.uuid || (await this.generateUuid());

    // Calculate outstanding amounts
    const outstanding = await this.calculateOutstanding(data.supplier_id);
    const outstandingBefore = outstanding.outstanding_balance;
    const outstandingAfter = outstandingBefore - parseFloat(data.amount);

    // Determine payment type based on amount vs outstanding
    let paymentType = data.payment_type;
    if (!paymentType) {
      if (parseFloat(data.amount) >= outstandingBefore) {
        paymentType = "full";
      } else if (outstandingBefore <= 0) {
        paymentType = "advance";
      } else {
        paymentType = "partial";
      }
    }

    const calculationDetails = JSON.stringify({
      total_collections: outstanding.total_collections,
      total_payments_before: outstanding.total_payments,
      calculated_at: now,
    });

    const result = await Database.execute(
      `INSERT INTO payments 
       (uuid, supplier_id, payment_type, amount, payment_date, payment_time,
        payment_method, reference_number, outstanding_before, outstanding_after,
        notes, calculation_details, synced, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        paymentUuid,
        data.supplier_id,
        paymentType,
        data.amount,
        data.payment_date,
        data.payment_time || now,
        data.payment_method || "cash",
        data.reference_number || null,
        outstandingBefore,
        outstandingAfter,
        data.notes || null,
        calculationDetails,
        now,
        now,
      ]
    );

    await this.addToSyncQueue("create", result.lastInsertRowId, {
      uuid: paymentUuid,
      supplier_id: data.supplier_id,
      payment_type: paymentType,
      amount: data.amount,
      payment_date: data.payment_date,
      payment_time: data.payment_time || now,
      payment_method: data.payment_method || "cash",
      reference_number: data.reference_number,
      notes: data.notes,
    });

    return await this.getById(result.lastInsertRowId);
  }

  async generateUuid() {
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    const hex = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(
      13,
      16
    )}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }

  async update(id, data) {
    const now = new Date().toISOString();
    const payment = await this.getById(id);

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Only allow updating notes and reference_number for recorded payments
    await Database.execute(
      `UPDATE payments SET 
        notes = ?, reference_number = ?,
        version = version + 1, synced = 0, updated_at = ?
       WHERE id = ?`,
      [
        data.notes !== undefined ? data.notes : payment.notes,
        data.reference_number !== undefined
          ? data.reference_number
          : payment.reference_number,
        now,
        id,
      ]
    );

    await this.addToSyncQueue("update", id, { id: payment.server_id, ...data });

    return await this.getById(id);
  }

  async delete(id) {
    const payment = await this.getById(id);
    if (!payment) {
      throw new Error("Payment not found");
    }

    await Database.execute("DELETE FROM payments WHERE id = ?", [id]);
    await this.addToSyncQueue("delete", id, { id: payment.server_id });
  }

  async addToSyncQueue(operation, entityId, data) {
    const now = new Date().toISOString();
    await Database.execute(
      `INSERT INTO sync_queue (entity_type, entity_id, operation, payload, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      ["payment", entityId, operation, JSON.stringify(data), now]
    );
  }

  /**
   * Calculate outstanding balance for a supplier
   */
  async calculateOutstanding(supplierId, upToDate = null) {
    const date = upToDate || new Date().toISOString().split("T")[0];

    const collections = await Database.queryFirst(
      `SELECT COALESCE(SUM(total_amount), 0) as total 
       FROM collections 
       WHERE supplier_id = ? AND collection_date <= ?`,
      [supplierId, date]
    );

    const payments = await Database.queryFirst(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM payments 
       WHERE supplier_id = ? AND payment_date <= ?`,
      [supplierId, date]
    );

    const totalCollections = parseFloat(collections?.total || 0);
    const totalPayments = parseFloat(payments?.total || 0);

    return {
      supplier_id: supplierId,
      total_collections: totalCollections,
      total_payments: totalPayments,
      outstanding_balance: totalCollections - totalPayments,
      calculated_at: new Date().toISOString(),
    };
  }

  /**
   * Get payment history with calculation details
   */
  async getPaymentHistory(supplierId, limit = 50) {
    return await Database.query(
      `SELECT p.*, s.name as supplier_name
       FROM payments p
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.supplier_id = ?
       ORDER BY p.payment_date DESC, p.created_at DESC
       LIMIT ?`,
      [supplierId, limit]
    );
  }

  /**
   * Get payment summary for date range
   */
  async getPaymentSummary(supplierId, fromDate = null, toDate = null) {
    let query = `
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM payments
      WHERE supplier_id = ?
    `;
    const params = [supplierId];

    if (fromDate) {
      query += " AND payment_date >= ?";
      params.push(fromDate);
    }

    if (toDate) {
      query += " AND payment_date <= ?";
      params.push(toDate);
    }

    query += " GROUP BY payment_method";

    const byMethod = await Database.query(query, params);

    // Get totals
    let totalQuery = `
      SELECT 
        COUNT(*) as payment_count,
        SUM(amount) as total_amount
      FROM payments
      WHERE supplier_id = ?
    `;
    const totalParams = [supplierId];

    if (fromDate) {
      totalQuery += " AND payment_date >= ?";
      totalParams.push(fromDate);
    }

    if (toDate) {
      totalQuery += " AND payment_date <= ?";
      totalParams.push(toDate);
    }

    const totals = await Database.queryFirst(totalQuery, totalParams);

    return {
      supplier_id: supplierId,
      from_date: fromDate,
      to_date: toDate,
      by_method: byMethod,
      total_payments: parseInt(totals?.payment_count || 0),
      total_amount: parseFloat(totals?.total_amount || 0),
    };
  }

  /**
   * Validate payment amount
   */
  async validatePaymentAmount(supplierId, amount) {
    const outstanding = await this.calculateOutstanding(supplierId);
    const isValid =
      parseFloat(amount) <= outstanding.outstanding_balance ||
      outstanding.outstanding_balance <= 0; // Allow advance payments

    return {
      is_valid: isValid,
      amount: parseFloat(amount),
      outstanding: outstanding.outstanding_balance,
      payment_type:
        outstanding.outstanding_balance <= 0
          ? "advance"
          : parseFloat(amount) >= outstanding.outstanding_balance
          ? "full"
          : "partial",
      message: isValid
        ? "Payment amount is valid"
        : `Payment amount exceeds outstanding balance of ${outstanding.outstanding_balance}`,
    };
  }
}

export default new PaymentRepository();
