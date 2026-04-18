Proyecto Next.js para reportar mascotas encontradas/perdidas con mapa Leaflet, backend en App Router y persistencia en PostgreSQL con Prisma.

## Que se puede hacer hoy

- Click en el mapa para abrir formulario de reporte.
- Boton Reportar Perdida para abrir el mismo formulario.
- Guardar mascota + persona responsable en base de datos.
- Ver lo guardado en la lista lateral y como pin en el mapa.

## Requisitos

- Node.js 20+ (recomendado 22 LTS).
- npm 10+.
- Docker Desktop (para PostgreSQL y pgAdmin local).

## Instalacion desde cero

### 1) Instalar dependencias

```bash
npm install
```

### 2) Crear variables de entorno

Copiar `.env.example` a `.env.local` y tambien a `.env`.

Windows (PowerShell):

```powershell
Copy-Item .env.example .env.local
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env.local
cp .env.example .env
```

Valores por defecto (ya vienen listos para Docker local):

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5433/animales_fantasticos
```

### 3) Levantar base de datos local

```bash
npm run db:up
```

Opcional para logs:

```bash
npm run db:logs
```

### 4) Generar cliente Prisma y sincronizar esquema

```bash
npm run prisma:generate
npm run prisma:db:push
```

### 5) Levantar la app

```bash
npm run dev
```

Abrir http://localhost:3000

### 6) Apagar servicios cuando termines

```bash
npm run db:down
```

## pgAdmin (opcional)

Con `npm run db:up` se levanta tambien pgAdmin:

- URL: http://localhost:5051
- Email: admin@animalesapp.com
- Password: admin123

Para crear la conexion al contenedor:

1. Add New Server.
2. General > Name: animales-fantasticos.
3. Connection:
4. Host name/address: postgres
5. Port: 5432
6. Maintenance database: animales_fantasticos
7. Username: postgres
8. Password: postgres

## Endpoints

- `GET /api/found-pets`: lista mascotas guardadas.
- `POST /api/found-pets`: crea mascota + responsable.

## Como esta organizado el proyecto

- `src/app/layout.tsx`: layout raiz global.
- `src/app/page.tsx`: entrypoint de la ruta `/` (wrapper fino).
- `src/app/login/page.tsx`: entrypoint de la ruta `/login` (wrapper fino).
- `src/app/api/found-pets/route.ts`: entrada HTTP (route handler).
- `src/features/home/pages/home-screen.tsx`: implementacion de pantalla Home.
- `src/features/login/pages/login-screen.tsx`: implementacion de pantalla Login.
- `src/modules/found-pets/presentation/http/`: capa de presentacion HTTP.
- `src/modules/found-pets/application/`: casos de uso, puertos y validaciones.
- `src/modules/found-pets/domain/`: entidades y contratos de dominio.
- `src/modules/found-pets/infrastructure/`: implementacion de repositorio con Prisma.
- `src/lib/prisma.ts`: PrismaClient singleton.
- `prisma/schema.prisma`: mapeo ORM a tablas `owners` y `found_pets`.

## Convencion de rutas (App Router)

- En este proyecto, `src/app` se usa solo para rutas, layouts y handlers HTTP.
- La UI/estado de cada pantalla vive en `src/features/...`.
- Regla base: `app/<segment>/page.tsx` define la ruta de navegacion.
- Regla base: `app/<segment>/route.ts` define endpoints HTTP.
- Ejemplo real: `src/app/page.tsx` -> `/`.
- Ejemplo real: `src/app/login/page.tsx` -> `/login`.
- Ejemplo real: `src/app/api/found-pets/route.ts` -> `/api/found-pets`.

## Guia rapida: agregar una funcionalidad basica (E2E)

Esta guia explica como agregar una feature nueva de punta a punta siguiendo la arquitectura actual.

### 1) Definir alcance y contrato

Antes de codear, definir:

- Que hace la feature (ej: crear/listar reportes).
- Payload de entrada (POST) y respuesta de salida (GET/POST).
- Campos obligatorios y validaciones.

### 2) Crear la ruta de API (entrypoint HTTP)

En App Router, el endpoint va en:

- `src/app/api/<feature>/route.ts`

Este archivo debe ser fino: solo recibe request y delega al modulo de backend.

Ejemplo del proyecto:

- `src/app/api/found-pets/route.ts`

### 3) Implementar backend por capas en modules

La logica de negocio no va en `src/app/api`; va en:

- `src/modules/<feature>/domain/`: entidades y tipos de dominio.
- `src/modules/<feature>/application/ports/`: interfaces de repositorio.
- `src/modules/<feature>/application/use-cases/`: casos de uso (listar/crear).
- `src/modules/<feature>/application/validators/`: validacion de payload.
- `src/modules/<feature>/infrastructure/`: implementacion con Prisma.
- `src/modules/<feature>/presentation/http/`: handlers HTTP (GET/POST).
- `src/modules/<feature>/index.ts`: exporta handlers para el route.ts.

Referencia real para copiar estructura:

- `src/modules/found-pets/`

### 4) Crear pantalla y componentes de frontend

En este repo, `src/app` solo define rutas. La pantalla real va en `features`.

- Wrapper de ruta: `src/app/<segment>/page.tsx`
- Pantalla real: `src/features/<feature>/pages/<feature>-screen.tsx`
- Componentes UI: `src/features/<feature>/components/`

Ejemplos reales:

- `src/app/page.tsx` -> `src/features/home/pages/home-screen.tsx`
- `src/app/login/page.tsx` -> `src/features/login/pages/login-screen.tsx`

### 5) Comunicacion front -> back

El front habla con la API via `fetch` contra `/api/<feature>`.

Flujo recomendado:

1. El usuario interactua con un formulario/componente.
2. La pantalla (`*-screen.tsx`) ejecuta `fetch` (GET o POST).
3. El endpoint `src/app/api/.../route.ts` delega al modulo.
4. El handler valida payload y llama al caso de uso.
5. El repositorio usa Prisma para leer/escribir DB.
6. La API responde JSON y el front actualiza estado/UI.

Buenas practicas de comunicacion:

- Enviar `Content-Type: application/json` en POST.
- Verificar `response.ok` siempre.
- Tipar request/response en frontend.
- Mostrar errores de API en UI de forma clara.

### 6) Persistencia con Prisma

Si la feature requiere tablas/campos nuevos:

1. Editar `prisma/schema.prisma`.
2. Generar cliente:

```bash
npm run prisma:generate
```

3. Sincronizar esquema:

```bash
npm run prisma:db:push
```

Notas:

- No editar manualmente `src/generated/prisma/`.
- Usar siempre el singleton de `src/lib/prisma.ts`.

### 7) Checklist de verificacion local

1. Levantar DB:

```bash
npm run db:up
```

2. Lint:

```bash
npm run lint
```

3. App:

```bash
npm run dev
```

4. Probar endpoint GET/POST (Postman, Thunder Client o terminal).
5. Confirmar que la UI refleja datos nuevos sin romper rutas existentes.

### 8) Errores comunes a evitar

- Poner logica de negocio dentro de `src/app/api/.../route.ts`.
- Saltar validacion de payload en `application/validators`.
- Acoplar frontend a modelos de Prisma sin mapear tipos de UI.
- Crear instancias nuevas de PrismaClient en varios archivos.

## Scripts utiles

- `npm run dev`: levantar app en modo desarrollo.
- `npm run lint`: correr linter.
- `npm run prisma:generate`: generar cliente Prisma.
- `npm run prisma:db:push`: sincronizar schema Prisma con DB.
- `npm run prisma:studio`: abrir Prisma Studio.
- `npm run db:up`: levantar postgres + pgAdmin con Docker.
- `npm run db:down`: bajar contenedores.
- `npm run db:logs`: ver logs de contenedores.

## Stack

- Next.js (App Router)
- React + TypeScript
- Leaflet / React-Leaflet
- PostgreSQL + Prisma ORM
- Docker Compose (PostgreSQL local)
