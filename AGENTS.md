<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project context
- Home replica la pantalla principal de la referencia con mapa Leaflet, cards y modal en src/app/page.tsx.
- Login replica el diseno original en src/app/login/page.tsx (route /login).
- Leaflet CSS se importa en src/app/page.tsx (no en globals.css) por compatibilidad con Tailwind/PostCSS.
- Leaflet icons usan CDN via L.Icon.Default.mergeOptions para evitar errores de iconUrl en Turbopack.
- Theme global y variables estan alineados con la referencia en src/app/globals.css.
