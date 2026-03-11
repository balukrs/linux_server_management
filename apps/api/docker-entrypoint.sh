#!/bin/sh
set -e
echo "Running database migrations..."
pnpm --filter @linux-mgmt/db migrate
echo "Seeding database..."
pnpm --filter @linux-mgmt/api db:seed:docker
echo "Starting API server..."
exec node apps/api/dist/index.js
