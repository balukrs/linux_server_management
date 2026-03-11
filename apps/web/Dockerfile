# Stage 1 — Prune
FROM node:20-slim AS pruner
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm dlx turbo prune @linux-mgmt/web --docker

# Stage 2 — Install dependencies
FROM node:20-slim AS installer
RUN corepack enable
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Stage 3 — Dev (hot-reload via volume mount)
FROM installer AS dev
COPY --from=pruner /app/out/full/ .
EXPOSE 5173
CMD ["pnpm", "--filter", "@linux-mgmt/web", "dev"]

# Stage 4 — Build
FROM installer AS builder
COPY --from=pruner /app/out/full/ .
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}
RUN pnpm turbo build --filter=@linux-mgmt/web

# Stage 5 — Serve with Nginx
FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
