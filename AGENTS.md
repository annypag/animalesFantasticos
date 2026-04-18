<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project context
- En App Router, src/app solo contiene entrypoints de rutas, layouts y route handlers.
- Home se expone en la ruta / con src/app/page.tsx, pero la pantalla vive en src/features/home/pages/home-screen.tsx.
- Login se expone en la ruta /login con src/app/login/page.tsx, pero la pantalla vive en src/features/login/pages/login-screen.tsx.
- La API /api/found-pets entra por src/app/api/found-pets/route.ts y delega en src/modules/found-pets.
- Leaflet CSS se importa en src/app/page.tsx (no en globals.css) por compatibilidad con Tailwind/PostCSS.
- Leaflet icons usan CDN via L.Icon.Default.mergeOptions para evitar errores de iconUrl en Turbopack.
- Theme global y variables estan alineados con la referencia en src/app/globals.css.
