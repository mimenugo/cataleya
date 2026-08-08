import { pool } from "../config/db.js";

export const SETTINGS_KEYS = ["business_name", "business_hours", "business_phone", "order_ready_message"];

export async function getSettings(locationId) {
  const result = await pool.query(
    `SELECT setting_key, setting_value FROM settings WHERE location_id = $1`,
    [locationId]
  );

  const settings = Object.fromEntries(SETTINGS_KEYS.map(key => [key, ""]));
  for (const row of result.rows) {
    settings[row.setting_key] = row.setting_value ?? "";
  }
  return settings;
}

export async function updateSettings(locationId, updates) {
  const entries = Object.entries(updates).filter(([key]) => SETTINGS_KEYS.includes(key));

  for (const [key, value] of entries) {
    await pool.query(
      `INSERT INTO settings (location_id, setting_key, setting_value, updated_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (location_id, setting_key)
       DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = now()`,
      [locationId, key, String(value ?? "")]
    );
  }

  return getSettings(locationId);
}
