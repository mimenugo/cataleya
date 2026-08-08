import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { pool } from "../config/db.js";
import { env } from "../config/env.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALEYA_PRODUCTS_PATH = join(__dirname, "..", "..", "..", "products.json");

const ORG = { name: "Cataleya", slug: "cataleya", phone: "526645812107" };
const LOCATION = { slug: env.locationSlug, name: "Cataleya Restaurante" };

async function seed() {
  const orgResult = await pool.query(
    `INSERT INTO organizations (name, slug, phone)
     VALUES ($1, $2, $3)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [ORG.name, ORG.slug, ORG.phone]
  );
  const organizationId = orgResult.rows[0].id;

  const locationResult = await pool.query(
    `INSERT INTO locations (organization_id, slug, name, phone)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [organizationId, LOCATION.slug, LOCATION.name, ORG.phone]
  );
  const locationId = locationResult.rows[0].id;
  console.log(`Ubicación lista: ${LOCATION.slug} (id ${locationId})`);

  if (!existsSync(CATALEYA_PRODUCTS_PATH)) {
    console.warn(`No se encontró ${CATALEYA_PRODUCTS_PATH}, se omite importación de productos.`);
    await pool.end();
    return;
  }

  const products = JSON.parse(readFileSync(CATALEYA_PRODUCTS_PATH, "utf8"));
  const categoryIds = new Map();

  for (const product of products) {
    let categoryId = categoryIds.get(product.category);
    if (!categoryId) {
      const categoryResult = await pool.query(
        `INSERT INTO categories (location_id, name)
         VALUES ($1, $2)
         ON CONFLICT (location_id, name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [locationId, product.category]
      );
      categoryId = categoryResult.rows[0].id;
      categoryIds.set(product.category, categoryId);
    }

    await pool.query(
      `INSERT INTO products (location_id, category_id, external_id, name, description, price, image_url, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (location_id, external_id) DO UPDATE SET
         category_id = EXCLUDED.category_id,
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         price = EXCLUDED.price,
         image_url = EXCLUDED.image_url,
         active = EXCLUDED.active`,
      [
        locationId,
        categoryId,
        String(product.id),
        product.name,
        product.description ?? null,
        product.price,
        product.image || null,
        product.active !== false
      ]
    );
  }

  console.log(`Importados ${products.length} productos en ${categoryIds.size} categorías.`);
  await pool.end();
}

seed().catch(error => {
  console.error("Error al sembrar datos:", error);
  process.exit(1);
});
