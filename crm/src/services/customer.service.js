import { pool } from "../config/db.js";
import { normalizePhone } from "../utils/phone.js";

export async function findOrCreateCustomer(client, { locationId, rawPhone, name }) {
  const phoneNormalized = normalizePhone(rawPhone);
  if (!phoneNormalized) {
    const error = new Error("Teléfono inválido: se requieren al menos 10 dígitos.");
    error.status = 400;
    throw error;
  }

  const existing = await client.query(
    `SELECT id, name, order_count FROM customers WHERE location_id = $1 AND phone_normalized = $2`,
    [locationId, phoneNormalized]
  );

  if (existing.rows.length > 0) {
    const customer = existing.rows[0];
    if (name && name !== customer.name) {
      await client.query(`UPDATE customers SET name = $1 WHERE id = $2`, [name, customer.id]);
    }
    return { id: customer.id, phoneNormalized, isNew: false };
  }

  const inserted = await client.query(
    `INSERT INTO customers (location_id, phone_normalized, raw_phone, name)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [locationId, phoneNormalized, rawPhone, name || null]
  );

  return { id: inserted.rows[0].id, phoneNormalized, isNew: true };
}

export async function listCustomers({ locationId, search }) {
  const params = [locationId];
  let where = "location_id = $1";

  if (search) {
    params.push(`%${search}%`);
    where += ` AND (name ILIKE $${params.length} OR phone_normalized ILIKE $${params.length})`;
  }

  const result = await pool.query(
    `SELECT id, name, phone_normalized, last_order_at, lifetime_value, order_count, created_at
     FROM customers
     WHERE ${where}
     ORDER BY last_order_at DESC NULLS LAST, created_at DESC`,
    params
  );

  return result.rows;
}

export async function getCustomerProfile(customerId, locationId) {
  const customerResult = await pool.query(
    `SELECT id, name, phone_normalized, email, last_order_at, lifetime_value, order_count, created_at
     FROM customers WHERE id = $1 AND location_id = $2`,
    [customerId, locationId]
  );

  if (customerResult.rows.length === 0) return null;

  const ordersResult = await pool.query(
    `SELECT id, order_number, total, status, delivery_method, created_at
     FROM orders WHERE customer_id = $1 ORDER BY created_at DESC`,
    [customerId]
  );

  return { ...customerResult.rows[0], orders: ordersResult.rows };
}

export async function registerCustomerOrder(client, { customerId, total }) {
  await client.query(
    `UPDATE customers
     SET last_order_at = now(),
         lifetime_value = lifetime_value + $2,
         order_count = order_count + 1
     WHERE id = $1`,
    [customerId, total]
  );
}
