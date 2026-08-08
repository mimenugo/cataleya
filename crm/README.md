# mi.menugo CRM — API (Fase 1: Core)

Backend que reemplaza el envío directo de pedidos por WhatsApp con una API centralizada:
recibe pedidos de Cataleya, normaliza el teléfono del cliente, identifica si ya existe
y guarda el historial en PostgreSQL.

## Requisitos

- Node.js 20+
- Docker Desktop (para levantar Postgres local) — o un Postgres propio

## Arranque rápido

```bash
cd crm
cp .env.example .env
npm install
docker compose up -d        # levanta Postgres en localhost:5432
npm run migrate             # crea las tablas
npm run seed                # crea la ubicación "cataleya" e importa products.json
npm run dev                 # arranca la API en http://localhost:4000
```

## Endpoints

### `POST /api/orders`

Recibe un pedido desde Cataleya, identifica/crea al cliente por teléfono y crea la orden.

```json
{
  "phone": "6641234567",
  "name": "Juana Pérez",
  "items": [{ "id": 1, "quantity": 2 }],
  "delivery": "A domicilio",
  "address": "Calle Falsa 123",
  "payment": "Efectivo",
  "cashAmount": "500",
  "notes": "Sin cebolla"
}
```

Respuesta `201`:

```json
{
  "order": { "id": 1, "orderNumber": "CATA-00001", "subtotal": 90, "total": 90, "status": "nuevo", "createdAt": "..." },
  "customer": { "id": 1, "phoneNormalized": "6641234567", "isNew": true }
}
```

El precio de cada línea se resuelve del lado del servidor contra la tabla `products`
(no se confía en el precio que manda el cliente).

### `GET/POST /api/whatsapp/webhook`

Webhook de Meta WhatsApp Cloud API. `GET` responde el reto de verificación
(`WHATSAPP_VERIFY_TOKEN`); `POST` recibe mensajes entrantes y los loguea
(en Fase 1 no se persisten conversaciones todavía, eso llega en Fase 3).

Para que el envío saliente funcione hace falta una cuenta de WhatsApp Business
real (`WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`) — mientras esas variables
estén vacías, `sendWhatsAppMessage` solo loguea un warning sin fallar.

## Variables de entorno

Ver `.env.example`. `DATABASE_URL` apunta por defecto al Postgres del
`docker-compose.yml` local; cuando exista el proyecto de Supabase basta con
cambiar esa cadena de conexión.

## Estructura

```
src/
  config/     # env y pool de conexión a Postgres
  db/         # schema.sql, migrate.js, seed.js
  services/   # lógica de negocio (clientes, órdenes, ubicación, whatsapp)
  controllers/
  routes/
  app.js      # Express app
  server.js   # entrypoint
```
