---
task: '[[Dashboard API & WebSocket]]'
phase: Phase One
created: 2026-02-20
status: Draft
---

# Implementation Guide: Dashboard API & WebSocket

## Overview

Build the API and real-time layer that makes the Dashboard page functional end-to-end. The System Metric Collection Service is already running and writing to PostgreSQL every 15 seconds — this task exposes that data through three REST endpoints and a Socket.io WebSocket server. When complete, the frontend can load the Dashboard with current and historical system metrics, and receive live updates automatically every 15 seconds without polling.

## Prerequisites

- System Metric Collection Service complete and running (Done ✓)
- `SystemMetric` table populated with data (type discriminators: `CPU`, `MEMORY_USED`, `MEMORY_TOTAL`, `NETWORK_IN`, `NETWORK_OUT`, `DISK_USED`, `DISK_TOTAL`)
- Backend Authentication & Authorization complete (auth middleware available)
- `@linux-mgmt/db` package exporting Prisma client
- `@linux-mgmt/shared` types package available
- Express app initialized in `apps/api` with auth middleware applied

## Scope

Backend only — `apps/api`. Covers three new route handlers (dashboard summary, historical metrics, storage mounts), a Socket.io server integrated with Express, a metrics event bus (EventEmitter), and a small addition to the existing collector orchestrator to emit on each cycle. No frontend changes, no database schema changes.

## Architecture Context

**Data flow** (from `architecture.md`):

```
Backend (collector, every 15s) → Database (persist) → WebSocket → Frontend (live update)
Linux System (/proc/mounts + statfs) → REST endpoint → Frontend (storage mounts)
Database (SystemMetric) → REST endpoint → Frontend (initial page load)
```

This task implements the second half of the monitoring pipeline: Database → API/WebSocket → Frontend.

**REST endpoints in scope** (from `api_specification.md`):

`GET /api/dashboard/summary`

```json
{
  "cpu": { "current": 45.2, "unit": "%" },
  "memory": { "used": 1024, "total": 4096, "unit": "MB" },
  "disk": { "used": 50, "total": 128, "unit": "GB" },
  "uptime": 86400,
  "networkIn": { "value": 150, "unit": "KB/s" },
  "networkOut": { "value": 50, "unit": "KB/s" }
}
```

`GET /api/dashboard/metrics?type={cpu|memory|network}&period={1h|6h|24h|7d}`

```json
{
  "type": "cpu",
  "period": "24h",
  "data": [{ "timestamp": "2026-02-20T10:00:00Z", "value": 45.2 }]
}
```

`GET /api/storage/mounts`

```json
{
  "mounts": [
    {
      "path": "/mnt/nas",
      "type": "nfs",
      "totalGB": 500,
      "usedGB": 350,
      "freeGB": 150,
      "status": "mounted"
    }
  ]
}
```

**SystemMetric type discriminators** (decided 2026-02-18):
| Type | Unit | Maps to |
|------|------|---------|
| `CPU` | `%` | `summary.cpu`, `metrics?type=cpu` |
| `MEMORY_USED` | `MB` | `summary.memory.used`, `metrics?type=memory` |
| `MEMORY_TOTAL` | `MB` | `summary.memory.total` |
| `NETWORK_IN` | `KB/s` | `summary.networkIn`, `metrics?type=network` |
| `NETWORK_OUT` | `KB/s` | `summary.networkOut` |
| `DISK_USED` | `GB` | `summary.disk.used` |
| `DISK_TOTAL` | `GB` | `summary.disk.total` |

**WebSocket real-time flow:**

```
collectMetrics() → persists to DB → emits 'batch-collected' on EventEmitter bus
                                          ↓
                              Socket.io server listens → broadcasts to authenticated clients
                                          ↓
                              Frontend receives payload → updates dashboard live
```

## Related Implementations

- **[[System Metric Collection Service/guide]]** — The collector this task extends. Step 1 of this guide makes a small addition to the collector's orchestrator (`collectMetrics()`) to emit on the event bus. Follow the same error-handling pattern: catch errors, log them, never crash the server.
- **[[Backend Authentication & Authorization/guide]]** — Auth middleware pattern to apply to new routes. The WS handshake auth reuses the same JWT verification logic already built.

## Implementation Steps

### Step 1: Create the Metrics Event Bus

- **What**: Create a shared Node.js `EventEmitter` instance that the collector and WebSocket server both import
- **Where**: Shared utility module in `apps/api` (e.g., `src/events/metricsEventBus.ts`)
- **Details**:
  - A single exported `EventEmitter` instance — nothing more.
  - Both the collector and Socket.io broadcaster import this same instance.
  - Event name: `'batch-collected'`
  - Payload emitted: the array of metric objects that were just persisted (same shape used for `createMany`) — each object has `type`, `value`, `unit`, `timestamp`.
  - Example:
    ```ts
    import { EventEmitter } from 'events'
    export const metricsEventBus = new EventEmitter()
    ```
- **Depends on**: None

### Step 2: Extend the Collector to Emit After Each Cycle

- **What**: After `createMany()` succeeds in `collectMetrics()`, emit `'batch-collected'` on the event bus with the persisted metric batch
- **Where**: Existing collector orchestrator in `apps/api` (the `collectMetrics()` function from the System Metric Collection Service)
- **Details**:
  - Import `metricsEventBus` from Step 1.
  - After the `prisma.systemMetric.createMany(...)` call succeeds, add:
    ```ts
    metricsEventBus.emit('batch-collected', metrics)
    ```
  - This goes inside the try block, after the DB write. If the DB write fails, do not emit (the catch block already logs the error).
  - `metrics` here is the filtered array (nulls removed) that was passed to `createMany` — it already has `type`, `value`, `unit`, `timestamp`.
  - This is the only change to the existing collector — everything else stays the same.
- **Depends on**: Step 1

### Step 3: Set Up Socket.io Server

- **What**: Create and configure a Socket.io server attached to the existing Express HTTP server
- **Where**: Socket.io setup module in `apps/api` (e.g., `src/socket/index.ts`), initialized alongside Express
- **Details**:
  - Install: `pnpm --filter @linux-mgmt/api add socket.io`
  - Socket.io attaches to the same `http.Server` instance that Express uses — not a separate port.
  - CORS config: for local development on the Pi, set `origin` to the Vite dev server URL. In production (same origin), set `origin: false`.
  - Basic setup:

    ```ts
    import { Server } from 'socket.io'
    import type { Server as HttpServer } from 'http'

    export function createSocketServer(httpServer: HttpServer) {
      const io = new Server(httpServer, {
        cors: { origin: process.env.CLIENT_URL ?? false },
      })
      return io
    }
    ```

  - The `httpServer` is the return value of `app.listen(...)` — make sure Express app initialization exposes it (or use `http.createServer(app)` explicitly before calling `.listen()`).

- **Depends on**: None (parallel with Steps 1–2)

### Step 4: Implement WebSocket Authentication

- **What**: Validate the JWT access token cookie on every incoming Socket.io connection before allowing the socket to proceed
- **Where**: Socket.io middleware in `apps/api` (e.g., `src/socket/authMiddleware.ts`)
- **Details**:
  - Socket.io supports `io.use((socket, next) => {...})` middleware — same concept as Express middleware.
  - The JWT `accessToken` cookie is sent automatically in the HTTP upgrade request headers (same-origin browser behavior).
  - Parse the cookie from `socket.handshake.headers.cookie` using the `cookie` package (already installed for Express cookie-parser):

    ```ts
    import { parse } from 'cookie'

    io.use((socket, next) => {
      const cookies = parse(socket.handshake.headers.cookie ?? '')
      const token = cookies['accessToken']
      if (!token) return next(new Error('UNAUTHORIZED'))

      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!)
        socket.data.user = payload // attach user to socket for later use
        next()
      } catch {
        next(new Error('UNAUTHORIZED'))
      }
    })
    ```

  - If auth fails, `next(new Error(...))` causes Socket.io to reject the connection — the client receives a `connect_error` event.
  - Reuse the same `JWT_SECRET` env var and `jwt.verify` call as the REST auth middleware.
  - No refresh token handling on WebSocket connections — if the access token expires mid-session, the client will get disconnected on the next reconnect attempt and can re-authenticate via REST first.

- **Depends on**: Step 3

### Step 5: Implement the Metrics Broadcaster

- **What**: Listen for `'batch-collected'` events on the event bus and broadcast the payload to all authenticated connected clients
- **Where**: Socket.io connection handler in `apps/api`
- **Details**:
  - After the socket server and auth middleware are set up, register a listener on the event bus:
    ```ts
    metricsEventBus.on('batch-collected', (metrics) => {
      io.emit('metrics-update', metrics)
    })
    ```
  - `io.emit()` broadcasts to all connected authenticated sockets (Socket.io only calls `io.emit` after auth middleware passes).
  - The event name `'metrics-update'` is what the frontend will listen for.
  - The payload is the raw metric batch array — same shape as what was persisted.
  - Keep the broadcaster simple: no filtering, no per-socket targeting. All connected clients get the same broadcast.
  - Register this listener once at app startup, not inside `io.on('connection', ...)` — it's server-level, not per-socket.
- **Depends on**: Steps 1, 2, 3, 4

### Step 6: Implement `GET /api/dashboard/summary`

- **What**: REST endpoint returning the latest value for each metric type plus system uptime
- **Where**: Dashboard router in `apps/api`
- **Details**:
  - For each of the 7 metric types, query the most recent row:

    ```ts
    const latest = (type: string) =>
      prisma.systemMetric.findFirst({
        where: { type },
        orderBy: { timestamp: 'desc' },
      })

    const [cpu, memUsed, memTotal, netIn, netOut, diskUsed, diskTotal] = await Promise.all([
      latest('CPU'),
      latest('MEMORY_USED'),
      latest('MEMORY_TOTAL'),
      latest('NETWORK_IN'),
      latest('NETWORK_OUT'),
      latest('DISK_USED'),
      latest('DISK_TOTAL'),
    ])
    ```

  - Use `Promise.all` to run all 7 queries in parallel.
  - **Uptime**: Read `/proc/uptime` — first space-separated value is seconds since boot (float). Parse with `fs.readFile('/proc/uptime', 'utf-8')` and split on whitespace. Return as integer seconds.
  - Handle the case where any metric is `null` (DB empty / collector hasn't run yet) — return `null` for that field rather than crashing.
  - Apply auth middleware to the route (existing `requireAuth` middleware).
  - Map DB rows to the API response shape defined in `api_specification.md`.

- **Depends on**: None (parallel with Steps 3–5)

### Step 7: Implement `GET /api/dashboard/metrics`

- **What**: REST endpoint returning historical time-series data for a given metric type and period
- **Where**: Dashboard router in `apps/api`
- **Details**:
  - Query params: `type` (`cpu` | `memory` | `network`) and `period` (`1h` | `6h` | `24h` | `7d`).
  - Validate both params — return `400 VALIDATION_ERROR` if either is missing or invalid.
  - **Period → timestamp cutoff mapping:**
    ```ts
    const periodMap: Record<string, number> = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
    }
    const since = new Date(Date.now() - periodMap[period])
    ```
  - **Type → DB type discriminator mapping** (one chart type maps to one or more DB types):
    ```ts
    const typeMap: Record<string, string[]> = {
      cpu: ['CPU'],
      memory: ['MEMORY_USED', 'MEMORY_TOTAL'],
      network: ['NETWORK_IN', 'NETWORK_OUT'],
    }
    ```
  - Query: `WHERE type IN (...) AND timestamp >= since ORDER BY timestamp ASC`
  - Return data grouped by type, or as a flat array with a `type` field — match the API spec shape.
  - For `memory` and `network` (two sub-types), return both series in the `data` array with their respective `type` discriminators so the frontend can render two lines per chart.
  - Apply auth middleware.
- **Depends on**: None (parallel with Steps 3–6)

### Step 8: Implement `GET /api/storage/mounts`

- **What**: REST endpoint listing all mounted storage with size stats per mount
- **Where**: Storage router in `apps/api`
- **Details**:
  - Read `/proc/mounts` — each line is: `device mountpoint fstype options dump pass`
  - Filter to real mounts only (exclude pseudo-filesystems): keep lines where `fstype` is NOT in `['proc', 'sysfs', 'devtmpfs', 'devpts', 'tmpfs', 'cgroup', 'cgroup2', 'mqueue', 'hugetlbfs', 'debugfs', 'tracefs', 'securityfs', 'pstore', 'autofs', 'fusectl', 'configfs', 'bpf', 'overlay', 'nsfs', 'ramfs']`. Keeping `ext4`, `nfs`, `nfs4`, `vfat`, `exfat`, `ntfs`, `xfs`, `btrfs`, `cifs` and similar real filesystems.
  - For each real mount, call `fs.promises.statfs(mountpoint)` to get size info:
    ```ts
    const stat = await fs.promises.statfs(mountpoint)
    const totalGB = (stat.blocks * stat.bsize) / 1024 ** 3
    const freeGB = (stat.bfree * stat.bsize) / 1024 ** 3
    const usedGB = totalGB - freeGB
    ```
  - **Handle unavailable mounts gracefully**: NAS or external drives may be temporarily disconnected. Wrap each `statfs` call in try-catch — if it throws, include the mount in the response with `status: 'unavailable'` and `null` for size fields.
  - Use `Promise.allSettled` (not `Promise.all`) so one failed mount doesn't abort the whole response.
  - Round all GB values to 1 decimal place.
  - Apply auth middleware.
- **Depends on**: None (parallel with Steps 3–7)

### Parallel Work

- **Can run in parallel**: Steps 1, 3, 6, 7, 8 are all independent starting points
- **Sequential chains**:
  - Step 1 → Step 2 (event bus must exist before extending collector)
  - Steps 3, 4 → Step 5 (socket server and auth must exist before broadcaster)
  - Step 1 → Step 5 (event bus must exist before broadcaster listens)

Full dependency graph:

```
Step 1 (event bus) ──┬──→ Step 2 (extend collector)
                     └──→ Step 5 (broadcaster)
Step 3 (socket.io) ──┬──→ Step 4 (WS auth)
                     └──→ Step 5 (broadcaster)
Step 4 ──────────────→ Step 5 (broadcaster)
Steps 6, 7, 8 are fully independent (REST endpoints)
```

## API Changes

All three endpoints are already defined in `api_specification.md` — no spec changes needed. This task is implementing what's already specified.

## Database Changes

_No database changes required._ The `SystemMetric` table and indexes are already in place. All queries use existing fields and the decided type discriminators.

## Key Decisions

| Decision                 | Choice                             | Reference                 |
| ------------------------ | ---------------------------------- | ------------------------- |
| Real-time strategy       | WebSocket                          | Decisions.md (2026-02-09) |
| WebSocket library        | socket.io                          | Decided 2026-02-20        |
| Collector-to-WS coupling | Node.js EventEmitter bus           | Decided 2026-02-20        |
| Collection interval      | 15 seconds                         | Decisions.md (2026-02-09) |
| Auth method              | JWT in HTTP-only cookie            | Decisions.md (2026-02-09) |
| Metric storage model     | Multi-row with type discriminators | Decisions.md (2026-02-18) |
| Development environment  | Directly on Raspberry Pi           | Decisions.md (2026-02-18) |

## Subtask Breakdown

No subtasks have been created yet. Suggested mapping based on the suggested subtasks in the task file:

| Step(s)       | Suggested Subtask                                             | Status |
| ------------- | ------------------------------------------------------------- | ------ |
| Steps 1, 2    | Set up metrics EventEmitter bus and extend collector to emit  | To Do  |
| Steps 3, 4, 5 | Set up Socket.io server with JWT auth and metrics broadcaster | To Do  |
| Step 6        | Implement `GET /api/dashboard/summary`                        | To Do  |
| Step 7        | Implement `GET /api/dashboard/metrics`                        | To Do  |
| Step 8        | Implement `GET /api/storage/mounts`                           | To Do  |

Steps 1 + 2 are grouped because they're small and tightly related. Steps 3 + 4 + 5 are grouped as the full WebSocket setup. The three REST endpoints can be separate subtasks or one combined subtask depending on preferred granularity.

## Testing Considerations

- **Summary endpoint**: Call `GET /api/dashboard/summary` after at least 2 collector cycles (30s). Verify all 7 fields are present with non-null values. Check uptime matches `/proc/uptime` output (`cat /proc/uptime`).
- **Metrics endpoint**: Test each `type` param (`cpu`, `memory`, `network`) with each `period` (`1h`, `6h`, `24h`, `7d`). Verify `data` is an array ordered by timestamp ascending. Verify invalid params return `400 VALIDATION_ERROR`.
- **Storage mounts**: Verify response includes the root mount (`/`) with reasonable GB values matching `df -h /`. If a NAS mount is configured, temporarily disconnect it and verify the endpoint still returns (with that mount marked `unavailable`).
- **WebSocket connection**: Connect a Socket.io client (or use the browser console with the socket.io client) and verify `connect_error` is received without a valid auth cookie. With a valid session, verify `metrics-update` events arrive approximately every 15 seconds.
- **WebSocket payload**: Each `metrics-update` event should contain an array of ~7 metric objects with the expected types, reasonable values, and a consistent timestamp.
- **Auth on REST routes**: Call any dashboard endpoint without a valid cookie — verify `401 UNAUTHORIZED` is returned.
- **Concurrent connections**: Open two browser tabs while logged in — verify both receive the `metrics-update` broadcast simultaneously.

## Notes

- **`GET /api/dashboard/metrics` response shape for multi-series types**: For `memory` (MEMORY_USED + MEMORY_TOTAL) and `network` (NETWORK_IN + NETWORK_OUT), the flat `data` array from the DB will contain rows with different `type` values. Return them with the `type` field included so the frontend can split them into separate chart series. This is a minor deviation from the API spec's example (which only shows a single-type response) — worth noting for frontend implementation.
- **Socket.io vs Express HTTP server**: Use `http.createServer(app)` explicitly and then `server.listen(PORT)` instead of `app.listen(PORT)`. Both work identically for HTTP, but the explicit `http.Server` instance is what you pass to `new Server(httpServer, ...)` for Socket.io.
- **Unauthenticated WS reconnect**: If a user's access token expires while the Socket.io connection is active, the connection stays alive (Socket.io auth only runs on connection). The user will get disconnected if they refresh the page or reconnect. This is acceptable for Phase One — no need to implement mid-session token refresh over WebSocket.
- **Storage mount filtering**: The pseudo-filesystem exclusion list in Step 8 covers common Linux types. If an unexpected fstype slips through (e.g., `overlay` from Docker), it will just appear with valid or null sizes — not harmful.
- **First cycle on app restart**: After restart, the first collector cycle primes delta metrics (CPU, network). The WS broadcaster emits on every cycle including the first — the first payload may have `0` for CPU and network rates. This is acceptable and matches the collector's existing behavior.

## Revision History

| Date       | Change                | Reason |
| ---------- | --------------------- | ------ |
| 2026-02-20 | Initial guide created | —      |
