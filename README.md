# Cataleya Restaurante — Menú digital

Menú digital estático, adaptable a celulares y listo para publicarse en GitHub Pages.

## Administración local del menú

- `admin.html`, `admin.css` y `admin.js` se conservan solamente en la computadora del administrador y no se publican.
- Abre el archivo local `admin.html` para crear, editar, ocultar y eliminar productos.
- El administrador guarda un borrador en el navegador.
- Al terminar, descarga `products.json`.
- Reemplaza el archivo `products.json` de esta carpeta con el archivo descargado.
- Publica el cambio con Git para que GitHub Pages actualice el catálogo.
- Los productos publicados se encuentran en `products.json`.
- El número de WhatsApp se configura en `WHATSAPP_NUMBER` usando código de país.
- Los colores principales están al inicio de `styles.css`.
- La dirección, horarios y teléfono visibles se encuentran en `index.html`.

La administración no necesita servidor, no contiene credenciales de GitHub y no forma parte del sitio público.

## Publicar en GitHub Pages

1. Crear un repositorio nuevo en GitHub.
2. Subir `index.html`, `styles.css`, `app.js` y este archivo.
3. Abrir **Settings → Pages**.
4. En **Build and deployment**, elegir **Deploy from a branch**.
5. Seleccionar la rama `main` y la carpeta `/ (root)`.

El sitio no requiere instalación, compilación ni servidor.
