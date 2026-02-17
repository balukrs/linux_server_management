# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Linux Machine Management — a full-stack TypeScript monorepo for Linux system monitoring and management. Uses Turborepo + pnpm workspaces.

## Common Commands

```bash
pnpm install                                    # Install all dependencies
pnpm dev                                        # Run all apps (web + api) in dev mode
pnpm build                                      # Build all apps
pnpm lint                                       # Lint all workspaces
pnpm format                                     # Format all files with Prettier

# Workspace-specific (filter by package name)
pnpm --filter @linux-mgmt/api dev               # API dev server
pnpm --filter @linux-mgmt/web dev               # Web dev server
pnpm --filter @linux-mgmt/api type-check        # Type check API
pnpm --filter @linux-mgmt/api test              # Run API tests (Jest)
pnpm --filter @linux-mgmt/api lint:fix          # Fix API lint issues

# Database
pnpm --filter @linux-mgmt/db migrate:dev        # Create + run dev migrations
pnpm --filter @linux-mgmt/db migrate            # Deploy migrations to prod
pnpm --filter @linux-mgmt/db prisma:generate    # Regenerate Prisma client
pnpm --filter @linux-mgmt/api db:seed           # Seed database
```

## Architecture

### Workspaces

| Workspace         | Package Name         | Purpose                                              |
| ----------------- | -------------------- | ---------------------------------------------------- |
| `apps/api`        | `@linux-mgmt/api`    | Express 5 backend (Node.js, JWT auth, REST API)      |
| `apps/web`        | `@linux-mgmt/web`    | React 19 SPA (Vite, Tailwind CSS 4, Radix UI/shadcn) |
| `packages/db`     | `@linux-mgmt/db`     | Prisma 7 ORM with PostgreSQL                         |
| `packages/shared` | `@linux-mgmt/shared` | Shared TypeScript types (auth request types)         |

### API Structure (`apps/api/src/`)

Routes follow a modular pattern: `routes/v1/{feature}/{index.ts, controller.ts, services.ts}`.

- **Route hierarchy**: `/api/v1/auth` (public), `/api/v1/user` (authenticated), `/api/v1/admin` (admin role)
- **Middleware chain**: `authHandler` verifies JWT → `adminRouteHandler` checks ADMIN role
- **Auth flow**: JWT access token (1h) + refresh token (7d) stored in HttpOnly cookies; refresh tokens persisted in DB
- **Error handling**: Custom error classes (`EntityExists`, `EntityNotFound`, `OperationFailed`, `UnAuthorized`) caught by global `errorHandler` middleware
- **Response format**: `sendSuccess(res, message, statusCode, data)` → `{ success: true, message, data }`

### Path Aliases

- API: `#*` → `./src/*` (e.g., `import x from '#middleware/auth-handling'`)
- Web: `@/*` → `./src/*` (e.g., `import x from '@/components/ui/button'`)

### Database Schema (Prisma)

Key models: `User` (with Role enum: ADMIN/VIEWER), `RefreshToken`, `AccessCode` (invitation codes), `ActivityLog`, `SystemMetric`, `SystemLog`, `DockerMetric`, `NodeServerMetric`, `Notification`. Schema at `packages/db/prisma/schema.prisma`.

### Turborepo Pipeline

- `build` depends on `^build` and `^prisma:generate`
- `dev` depends on `^prisma:generate` (no caching)
- `type-check` depends on `^build` and `^prisma:generate`

## Code Style

- **Prettier**: No semicolons, single quotes, trailing commas, 100 char width
- **TypeScript**: Strict mode, `verbatimModuleSyntax` (use `type` keyword for type imports), ESM throughout
- **Pre-commit hooks** (Husky + lint-staged): Auto-formats staged files, runs `turbo lint` and `turbo type-check`

## Research Documentation (`research/`)

The `research/` folder contains project planning, architecture decisions, and implementation guides. **This folder is synced with an external environment** — any changes made here must be reflected there, and vice versa.

### Structure

```
research/Phase One/
├── README.md                 # Project vision and principles
├── Project_Requirements.md   # Phase One scope (read-only monitoring MVP)
├── Tech_Stack.md             # Technology choices with rationale
├── Progress.md               # Task tracking and completion status
├── Blockers.md               # Open issues
├── Decisions.md              # Architecture decision log (8 decisions)
├── Architecture/
│   ├── architecture.md       # System component diagram and data flows
│   ├── project_structure.md  # Monorepo layout guide
│   ├── api_specification.md  # REST API endpoint definitions
│   ├── db_schema.md          # Prisma database schema design
│   └── ui_requirements.md    # Frontend UI/UX specs (dark mode, shadcn)
├── Implementation/
│   ├── Set Up Database (PostgreSQL + Prisma)/guide.md
│   └── Backend Authentication & Authorization/guide.md
└── Suggestions/              # Prioritized next-step recommendations
```

### Key Concepts

- **Phase One = observability only**: Read-only monitoring of a single Raspberry Pi. No control actions (start/stop services, kill processes, etc.) — that's Phase Two.
- **Guiding principle**: "Make the system observable before making it powerful."
- **Metrics**: 15-second collection interval, 14-day retention.
- **Registration**: Public signup gated by admin-generated access codes.
- **Always consult research docs** before implementing new features — they contain API specs, schema designs, and architectural decisions that should be followed.

## Environment Variables

API requires `.env` in `apps/api/`: `PORT`, `APP_SECRET` (JWT signing), `DATABASE_URL`, `NODE_ENV`, `APP_DEBUG`, `ADMIN_SEED_PASSWORD`.
DB requires `.env` in `packages/db/`: `DATABASE_URL`.
