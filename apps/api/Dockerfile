# Stage 1 — Prune
FROM node:20-slim AS pruner
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm dlx turbo prune @linux-mgmt/api --docker

# Stage 2 — Install dependencies
FROM node:20-slim AS installer
RUN corepack enable
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Stage 3 — Dev (migrations + hot-reload via volume mount)
FROM installer AS dev
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY --from=pruner /app/out/full/ .
EXPOSE 3000
CMD ["sh", "-c", "pnpm --filter @linux-mgmt/db migrate && pnpm --filter @linux-mgmt/api db:seed:docker && pnpm --filter @linux-mgmt/api dev:docker"]

# Stage 4 — Build
FROM installer AS builder
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=@linux-mgmt/api

# Stage 5 — Run
FROM node:20-slim AS runner
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app
COPY --from=builder /app/ .
COPY apps/api/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
