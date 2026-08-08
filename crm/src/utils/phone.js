/**
 * Normaliza un teléfono a sus últimos 10 dígitos (formato local MX),
 * evitando duplicar clientes por variaciones de prefijo (+52, 521, espacios, guiones).
 * Ej: "+52 664 123 4567" -> "6641234567"
 */
export function normalizePhone(rawPhone) {
  const digits = String(rawPhone ?? "").replace(/\D/g, "");
  const normalized = digits.slice(-10);
  if (normalized.length !== 10) {
    return null;
  }
  return normalized;
}
