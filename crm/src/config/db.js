import pg from "pg";
import { env } from "./env.js";

export const pool = new pg.Pool({ connectionString: env.databaseUrl });

// pg emite 'error' en el pool cuando un cliente inactivo falla en segundo plano
// (p. ej. credenciales inválidas reintentando); sin este listener, Node trata
// el evento como no manejado y tumba todo el proceso.
pool.on("error", error => {
  console.error("Error inesperado en el pool de Postgres:", error.message);
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
