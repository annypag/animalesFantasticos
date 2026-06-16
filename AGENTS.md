<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project context
- En App Router, src/app solo contiene entrypoints de rutas, layouts y route handlers.
- Home se expone en la ruta / con src/app/page.tsx, pero la pantalla vive en src/features/home/pages/home-screen.tsx.
- Login se expone en la ruta /login con src/app/login/page.tsx, pero la pantalla vive en src/features/login/pages/login-screen.tsx.
- La API /api/found-pets entra por src/app/api/found-pets/route.ts y delega en src/modules/found-pets.
- La API /api/lost-pets entra por src/app/api/lost-pets/route.ts y delega en src/modules/lost-pets.
- Mensajería: ver src/features/messaging/README.md; APIs en src/modules/messaging; ChatModal desde detalle de mascota DB. Incluye polling, notificaciones y resolución de caso.
- Búsqueda visual por imagen: src/features/matching/ (UI) + src/modules/matching/ (lógica). Usa Voyage AI (voyage-multimodal-3, 1024 dims) para generar embeddings al crear un FoundPet y buscar coincidencias via pgvector. Requiere VOYAGE_API_KEY en .env.local.
- Leaflet CSS se importa en src/app/page.tsx (no en globals.css) por compatibilidad con Tailwind/PostCSS.
- Leaflet icons usan CDN via L.Icon.Default.mergeOptions para evitar errores de iconUrl en Turbopack.
- Theme global y variables estan alineados con la referencia en src/app/globals.css.

## Setup del entorno (pasos críticos)
1. La DB usa `pgvector/pgvector:pg17` (no postgres:17-alpine). Si venías de develop, hacer `npm run db:down` antes de `npm run db:up`.
2. Variables de entorno requeridas además de DATABASE_URL: `VOYAGE_API_KEY` (pedirla al equipo).
3. Después de cualquier cambio de schema: `npx prisma db push && npx prisma generate`.
4. Para datos de prueba: `npm run db:seed` (3 usuarios, contraseña `seed1234`: sofia/martin/lucia @animalesfantasticos.local).

## Agent standard
- Fuente de verdad para el flujo del agente: `.github/agents/next-js-typescript-fullstack.agent.md`.
- Si hay conflicto entre guias, priorizar ese archivo para mantener consistencia en todo el equipo.


## objetivo
la aplicación de búsqueda de animales perdidos, el objetivo de la aplicación es lograr que las personas puedan hallar a su mascota perdida con ayuda de la comunidad de la aplicación, la cual publica reporte de mascotas hallada en un formulario para poder matchear la coincidencias con las búsquedas activas y de esta manera rencontrar al dueño con su mascota.
La aplicación debe permitir que una persona pueda publicar sin ser usuario y dejar su publicación con sus datos de contacto compartido con el foro de usuarios, pero si se registra en la aplicación logra acceder a listado de mascotas encontradas que los demás usuarios de la aplicación publicaron y marchaear por IA con reconocimiento de imagen las coincidencias de la mascota.  
La publicación de pet-lost debe tener datos obligatorios de la mascota como: fotos de la mascota (mientras más ganas precisión) sexo, tipo raza, fecha de extravío/hallazgo con formato dd/mm/yyyym , latitud y longitud y barrio. también tenes disponible un mapa con filtros para ver en tiempo real las mascotas halladas y filtrar por barrio y raza.
El sign-up de la aplicación por el momento debería ser email y alguna autenticación de correo sencilla.
Stack tecnológico: Node.JS - Prisma (ORM) - Postgres.
Api de mapa: leaflet y nominatim.openstreetmap.org/reverse.
