import "dotenv/config";

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: required("DATABASE_URL"),
  locationSlug: process.env.LOCATION_SLUG ?? "cataleya",
  corsOrigins: (process.env.CORS_ORIGIN ?? "*").split(",").map(origin => origin.trim()),
  supabaseUrl: (process.env.SUPABASE_URL ?? "").replace(/\/$/, ""),
  whatsapp: {
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? "",
    token: process.env.WHATSAPP_TOKEN ?? "",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? ""
  }
};
