# mi.menugo CRM — Panel (Fase 2)

Panel interno (Next.js) para ver clientes, su historial y mover pedidos en un Kanban.
Requiere la API de `crm/` corriendo y un usuario creado en Supabase Auth.

## Arranque rápido

```bash
cd crm/dashboard
cp .env.local.example .env.local
# completa NEXT_PUBLIC_SUPABASE_ANON_KEY (Supabase → Project Settings → API → anon public)
npm install
npm run dev   # http://localhost:3001
```

## Crear el primer usuario

1. Supabase → **Authentication → Users → Add user**, crea el usuario con correo y contraseña.
2. En el **SQL Editor** de Supabase, vincúlalo a la ubicación de Cataleya:

```sql
insert into public.users (email, auth_user_id, role, location_id)
select email, id, 'admin', (select id from public.locations where slug = 'cataleya')
from auth.users
where email = 'tu-correo@ejemplo.com';
```

Sin esa fila en `public.users`, el login de Supabase funciona pero la API rechaza
las peticiones (403 "Este usuario no tiene acceso al CRM").

## Páginas

- `/login` — inicio de sesión
- `/` — resumen del día (pedidos y ventas de hoy)
- `/clientes` — tabla con búsqueda por nombre/teléfono
- `/clientes/[id]` — perfil: historial de pedidos, total gastado, frecuencia
- `/pedidos` — Kanban (Nuevo → Preparación → Listo → Entregado), el select de cada
  tarjeta actualiza el estado en la API

## Notas

- El middleware (`middleware.js`) redirige a `/login` si no hay sesión de Supabase,
  y de `/login` a `/` si ya la hay.
- Todas las llamadas a la API van con el `access_token` de Supabase como
  `Authorization: Bearer` — la API lo valida contra `SUPABASE_JWT_SECRET`.
