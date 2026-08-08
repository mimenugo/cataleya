import { pool } from "../config/db.js";

export async function getTodaySummary(locationId) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS order_count, COALESCE(SUM(total), 0)::numeric AS total_sales
     FROM orders
     WHERE location_id = $1 AND created_at >= date_trunc('day', now())`,
    [locationId]
  );

  const byStatusResult = await pool.query(
    `SELECT status, COUNT(*)::int AS count
     FROM orders
     WHERE location_id = $1 AND created_at >= date_trunc('day', now())
     GROUP BY status`,
    [locationId]
  );

  return {
    orderCount: result.rows[0].order_count,
    totalSales: Number(result.rows[0].total_sales),
    byStatus: Object.fromEntries(byStatusResult.rows.map(row => [row.status, row.count]))
  };
}
