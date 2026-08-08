import { pool } from "../config/db.js";
import { env } from "../config/env.js";

let cachedLocation = null;

export async function getDefaultLocation() {
  if (cachedLocation) return cachedLocation;

  const result = await pool.query(
    `SELECT id, organization_id, slug, name FROM locations WHERE slug = $1`,
    [env.locationSlug]
  );

  if (result.rows.length === 0) {
    throw new Error(
      `No existe la ubicación "${env.locationSlug}". Corre "npm run seed" antes de recibir pedidos.`
    );
  }

  cachedLocation = result.rows[0];
  return cachedLocation;
}
