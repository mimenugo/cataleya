import { jwtVerify, createRemoteJWKSet } from "jose";
import { env } from "../config/env.js";
import { pool } from "../config/db.js";
import { asyncHandler } from "./asyncHandler.js";

// Supabase firma los access tokens con llaves asimétricas rotables; se validan
// contra su JWKS público en vez de un secreto compartido (no requiere guardar nada sensible).
const jwks = createRemoteJWKSet(new URL(`${env.supabaseUrl}/auth/v1/.well-known/jwks.json`));

/**
 * Verifica el access token de Supabase Auth (Authorization: Bearer <token>)
 * y adjunta req.user con el rol/ubicación definidos en la tabla users.
 */
export const requireAuth = asyncHandler(async function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Falta el token de autenticación" });
  }

  if (!env.supabaseUrl) {
    console.error("SUPABASE_URL no está configurado");
    return res.status(500).json({ error: "Error interno" });
  }

  let payload;
  try {
    ({ payload } = await jwtVerify(token, jwks, { issuer: `${env.supabaseUrl}/auth/v1` }));
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }

  const result = await pool.query(
    `SELECT id, email, role, location_id FROM users WHERE auth_user_id = $1`,
    [payload.sub]
  );

  if (result.rows.length === 0) {
    return res.status(403).json({ error: "Este usuario no tiene acceso al CRM" });
  }

  req.user = result.rows[0];
  next();
});
