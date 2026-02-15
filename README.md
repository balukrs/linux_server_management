# Linux Machine Management

A full-stack monorepo for Linux machine management, built with **Turborepo**, **pnpm workspaces**, React, and Node.js.

## 📁 Project Structure

```
linux-machine-management/
├── apps/
│   ├── web/              # React + Vite frontend
│   └── api/              # Node.js + Express backend
├── packages/
│   ├── db/               # Prisma ORM, schema, and database client
│   └── shared/           # Shared types and utilities
├── turbo.json            # Turborepo configuration
├── pnpm-workspace.yaml   # pnpm workspace definition
└── package.json          # Root workspace config
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (using NVM recommended)
- pnpm 10+

### Installation

```bash
# Install dependencies for all workspaces
pnpm install
```

### Development

```bash
# Run all apps in development mode (parallel)
pnpm dev

# Run specific workspace
pnpm --filter @linux-mgmt/web dev
pnpm --filter @linux-mgmt/api dev
```

### Building

```bash
# Build all apps
pnpm build

# Build specific workspace
pnpm --filter @linux-mgmt/web build
pnpm --filter @linux-mgmt/api build
```

### Linting & Formatting

```bash
# Lint all workspaces
pnpm lint

# Format all files
pnpm format

# Lint specific workspace
pnpm --filter @linux-mgmt/web lint
pnpm --filter @linux-mgmt/api lint
```

**Code Quality Features:**

- ✅ **Standardized ESLint** - Root-level config with TypeScript + React rules
- ✅ **Prettier Formatting** - Consistent code style across all workspaces
- ✅ **Pre-commit Hooks** - Husky + lint-staged automatically lint and format staged files
- ✅ **Type Safety** - Strict TypeScript rules with `consistent-type-imports`

## 📦 Workspaces

### `apps/web` - Frontend

- **Stack:** React 19, TypeScript, Vite
- **Port:** 5173 (dev)
- **Features:** Hot module reload, SWC compiler

### `apps/api` - Backend

- **Stack:** Node.js, Express, TypeScript
- **Port:** 3000 (default)
- **Features:** TypeScript with tsx watch mode

### `packages/db` - Database

- **Stack:** Prisma 7, PostgreSQL
- **Purpose:** Database schema, migrations, and generated Prisma client
- **Usage:** Imported as `@linux-mgmt/db` in the backend
- **Commands:**
  - `pnpm --filter @linux-mgmt/db prisma:generate` - Generate Prisma client
  - `pnpm --filter @linux-mgmt/db migrate:dev` - Run dev migrations
  - `pnpm --filter @linux-mgmt/db migrate` - Deploy migrations

### `packages/shared` - Shared Code

- **Purpose:** Shared types, interfaces, and utilities
- **Usage:** Imported as `@linux-mgmt/shared` in both frontend and backend

## 🛡️ Code Quality & Standards

### ESLint Configuration

Standardized ESLint setup with root-level configuration:

- **Base Rules:** TypeScript best practices for all workspaces
- **React Rules:** Special rules for `apps/web` (React Hooks, React Refresh)
- **Type Imports:** Enforced `type` keyword for type-only imports
- **No Console:** Warns on console usage (except `warn` and `error`)

### Prettier Configuration

Consistent formatting across all workspaces:

- Single quotes, no semicolons
- 100 character print width
- 2 spaces for indentation
- Trailing commas in all multi-line structures

### Pre-commit Hooks

Automated code quality checks on every commit:

```bash
# Runs automatically on git commit
- ESLint --fix on *.{ts,tsx,js,jsx}
- Prettier --write on all files
```

**What this means:**

- ✅ Code is automatically formatted before commit
- ✅ Linting errors are fixed automatically when possible
- ✅ Commits are blocked if unfixable errors exist
- ✅ All team members follow the same code standards

## 🔧 Key Commands

| Command                                        | Description                       |
| ---------------------------------------------- | --------------------------------- |
| `pnpm dev`                                     | Run all apps in dev mode          |
| `pnpm build`                                   | Build all apps                    |
| `pnpm lint`                                    | Lint all workspaces               |
| `pnpm format`                                  | Format all files                  |
| `pnpm --filter <workspace> <command>`          | Run command in specific workspace |
| `pnpm --filter @linux-mgmt/db prisma:generate` | Generate Prisma client            |
| `pnpm --filter @linux-mgmt/db migrate:dev`     | Run database migrations (dev)     |
| `pnpm --filter @linux-mgmt/api db:seed`        | Seed the database                 |

## 🐳 Docker Support (Future)

Turborepo provides excellent Docker support with `turbo prune`:

```bash
# Prune workspace for Docker
turbo prune --scope=@linux-mgmt/api --docker
```

This creates a minimal build context with only the necessary dependencies.

## 🔗 Workspace Dependencies

Workspaces can depend on each other using `workspace:*` protocol:

```json
{
  "dependencies": {
    "@linux-mgmt/db": "workspace:*",
    "@linux-mgmt/shared": "workspace:*"
  }
}
```

Changes in workspace packages are automatically available to apps without republishing.

## 📝 Adding New Packages

1. Create a new directory in `apps/` or `packages/`
2. Add a `package.json` with name `@linux-mgmt/<name>`
3. Run `pnpm install` to link workspaces
4. Import in other workspaces using the package name

# Install to root (affects all workspaces)

pnpm add -D prettier -w

# Install to specific workspace

pnpm add express --filter @linux-mgmt/api
pnpm add react --filter @linux-mgmt/web

# Install all dependencies

pnpm install

## 🎯 Benefits of This Setup

✅ **Code Sharing** - Share types and utilities between frontend/backend
✅ **Fast Builds** - Turborepo caching speeds up CI/CD
✅ **Parallel Execution** - Run tasks across workspaces simultaneously
✅ **Type Safety** - End-to-end type safety with shared types
✅ **Single Source of Truth** - One repo, one version, one deploy
✅ **Code Quality** - Automated linting and formatting on every commit
✅ **Standardization** - Same code style across all workspaces

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Commit your changes (pre-commit hooks will automatically lint and format)
4. Run `pnpm build` to verify builds succeed
5. Push and create a PR

**Note:** Pre-commit hooks will automatically:

- Fix ESLint errors when possible
- Format code with Prettier
- Block commits if there are unfixable linting errors

## 📄 Configuration Files

| File                  | Purpose                                         |
| --------------------- | ----------------------------------------------- |
| `turbo.json`          | Turborepo pipeline and caching configuration    |
| `pnpm-workspace.yaml` | pnpm workspace definition                       |
| `eslint.config.js`    | Root ESLint configuration (all workspaces)      |
| `prettier.config.js`  | Root Prettier configuration (all workspaces)    |
| `.husky/pre-commit`   | Git pre-commit hook script                      |
| `package.json`        | Root workspace config with lint-staged settings |

## 📚 Learn More

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
