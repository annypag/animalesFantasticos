# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build (use to verify before closing a task)
npm run lint         # ESLint
npm run db:up        # Start PostgreSQL + pgAdmin via Docker
npm run db:down      # Stop containers
npm run db:seed      # Seed DB (node prisma/seed.js)

npx prisma generate  # Regenerate client after schema changes (outputs to src/generated/prisma/)
npx prisma db push   # Sync schema to DB (no migrations file generated)
npx prisma studio    # Browse DB visually
```

> No test suite exists yet. Verification is done via `npm run build` + manual testing.

## Architecture

### Layer map

```
src/app/                   → Route entrypoints only (page.tsx, route.ts, layout.tsx)
src/features/<feature>/    → UI screens and components
  pages/<name>-screen.tsx  → Full screen implementation
  components/              → UI-only components
src/modules/<feature>/     → Backend logic, fully layered:
  domain/                  → Types and entities
  application/ports/       → Repository interfaces
  application/use-cases/   → Business logic (no Next.js, no Prisma)
  application/validators/  → Payload parsing and validation
  infrastructure/          → PrismaClient implementations
  presentation/http/       → HTTP handlers (parse → validate → use-case → respond)
  index.ts                 → Exports handlers consumed by route.ts
src/modules/shared/        → Cross-module: ValidationError, PetSpecies, payload parsers
src/lib/prisma.ts          → PrismaClient singleton (use this, never instantiate directly)
src/generated/prisma/      → Auto-generated Prisma client (do not edit)
prisma/schema.prisma       → Source of truth for DB schema
```

### Key domain models

- **User** — email + bcrypt password or Google OAuth (`googleId`). Auth uses `jose` for JWT.
- **FoundPet** / **LostPet** — both belong to a `User`. `FoundPet` supports multiple images (`imageUrls: Json`).
- **Conversation** / **Message** — one conversation per pet report (unique on `petKind + petId`). Chat images stored locally in `public/uploads/chat/`.
- **MatchJob** / **PetMatch** — async AI image-matching pipeline. `MatchJob` tracks job status (PENDING → RUNNING → DONE/FAILED); `PetMatch` stores score + explanation per `(lostPetId, foundPetId)` pair.

### Auth flow

Email sign-up uses bcrypt password hash stored in `User.passwordHash`. Google OAuth stores `User.googleId`. Sessions use JWT via `jose`. Login screen: `src/features/login/pages/login-screen.tsx`.

### Leaflet quirks

- Import Leaflet CSS in `src/app/page.tsx` (not `globals.css`) — required for Tailwind/PostCSS compatibility.
- Icons configured via `L.Icon.Default.mergeOptions` with CDN URLs to avoid Turbopack `iconUrl` errors.
- Geocoding uses `nominatim.openstreetmap.org/reverse`.

### Next.js version note

This project runs **Next.js 16.2.2** with React 19. Before writing any Next.js code, check `node_modules/next/dist/docs/` — APIs may differ from training data.
