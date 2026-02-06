# Linux Machine Management

A full-stack monorepo for Linux machine management, built with **Turborepo**, **pnpm workspaces**, React, and Node.js.

## 📁 Project Structure

```
linux-machine-management/
├── apps/
│   ├── web/              # React + Vite frontend
│   └── api/              # Node.js + Express backend
├── packages/
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
```

## 📦 Workspaces

### `apps/web` - Frontend

- **Stack:** React 19, TypeScript, Vite
- **Port:** 5173 (dev)
- **Features:** Hot module reload, SWC compiler

### `apps/api` - Backend

- **Stack:** Node.js, Express, TypeScript
- **Port:** 3000 (default)
- **Features:** TypeScript with tsx watch mode

### `packages/shared` - Shared Code

- **Purpose:** Shared types, interfaces, and utilities
- **Usage:** Imported as `@linux-mgmt/shared` in both frontend and backend

## 🔧 Key Commands

| Command                               | Description                       |
| ------------------------------------- | --------------------------------- |
| `pnpm dev`                            | Run all apps in dev mode          |
| `pnpm build`                          | Build all apps                    |
| `pnpm lint`                           | Lint all workspaces               |
| `pnpm format`                         | Format all files                  |
| `pnpm --filter <workspace> <command>` | Run command in specific workspace |

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
    "@linux-mgmt/shared": "workspace:*"
  }
}
```

Changes in `packages/shared` are automatically available to apps without republishing.

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

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm lint` and `pnpm build` to verify
4. Commit with conventional commits
5. Push and create a PR

## 📚 Learn More

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
