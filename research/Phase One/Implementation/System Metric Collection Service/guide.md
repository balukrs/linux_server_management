---
task: '[[System Metric Collection Service]]'
phase: Phase One
created: 2026-02-18
status: Draft
---

# Implementation Guide: System Metric Collection Service

## Overview

Build the core data pipeline for Phase One — a background service inside the Express API that reads system metrics from the Linux `/proc` filesystem every 15 seconds and persists them to PostgreSQL via Prisma. This service feeds the Dashboard (live values + historical charts), and future monitoring pages depend on this pattern for Docker and Node.js metrics. Development happens directly on the Raspberry Pi.

## Prerequisites

- Raspberry Pi with Linux OS, Node.js 18+, pnpm 10+ installed
- Monorepo cloned on the Pi with `pnpm install` completed
- PostgreSQL installed and running on the Pi
- Database migrated (`pnpm --filter @linux-mgmt/db migrate`)
- `.env` configured with `DATABASE_URL` and `PORT`
- `@linux-mgmt/db` package exporting Prisma client
- `@linux-mgmt/shared` types package available
- Express app initialized in `apps/api` with auth middleware

## Scope

Backend service within `apps/api` — a metric collector module that reads Linux system files, a scheduler that triggers collection every 15 seconds, and the Prisma persistence layer. No API endpoints in this task (those come in Dashboard API task). No frontend changes.

## Architecture Context

**Data flow** (from `architecture.md`):

```
Linux System (/proc files) → Backend (collector) → Database (persist) → API → Frontend (display)
```

This task implements the first half: Linux System → Database.

**SystemMetric model** (from `db_schema.md`):

```prisma
model SystemMetric {
  id        String   @id @default(uuid())
  type      String   // specific discriminators: CPU, MEMORY_USED, MEMORY_TOTAL, etc.
  value     Float
  unit      String   // "%", "MB", "KB/s"
  timestamp DateTime @default(now())
}
```

**Type discriminators** (decided 2026-02-18):
| Type | Source | Unit | Description |
|------|--------|------|-------------|
| `CPU` | `/proc/stat` | `%` | Overall CPU usage percentage |
| `MEMORY_USED` | `/proc/meminfo` | `MB` | Used memory |
| `MEMORY_TOTAL` | `/proc/meminfo` | `MB` | Total memory |
| `NETWORK_IN` | `/proc/net/dev` | `KB/s` | Network bytes received per second |
| `NETWORK_OUT` | `/proc/net/dev` | `KB/s` | Network bytes transmitted per second |
| `DISK_USED` | `/proc/mounts` + `statvfs` | `GB` | Primary disk used space |
| `DISK_TOTAL` | `/proc/mounts` + `statvfs` | `GB` | Primary disk total space |

Each 15-second cycle produces ~7 rows. Over 14 days: ~7 x 5,760 = ~40,320 rows.

**Indexes** (already defined in schema):

- `@@index([type, timestamp])` — for Dashboard queries like `WHERE type = 'CPU' AND timestamp > ?`
- `@@index([timestamp])` — for retention cleanup

## Related Implementations

- **[[Set Up Database (PostgreSQL + Prisma)/guide]]** — Defined the SystemMetric model, indexes, and data retention cleanup job. The cleanup job already handles purging metrics older than 14 days. Follow the same Prisma patterns (UUIDs, UTC timestamps).
- **[[Backend Authentication & Authorization/guide]]** — Established the Express app structure, middleware patterns, and error format. The collector runs alongside auth but doesn't need auth itself (it's an internal background process, not an API endpoint).

## Implementation Steps

### Step 1: Create the `/proc` Reader Module

- **What**: Build a module that reads raw data from Linux `/proc` files using Node.js `fs.readFile` (async)
- **Where**: Collector/metrics module in `apps/api`
- **Details**:
  This module provides raw data parsing functions. Each function reads a specific `/proc` file and returns structured data.

  **CPU — `/proc/stat`**:
  - Read the first line: `cpu  user nice system idle iowait irq softirq steal`
  - These are cumulative tick counts since boot, not percentages
  - To calculate CPU %, you need **two readings** and compute the delta:
    ```
    total = user + nice + system + idle + iowait + irq + softirq + steal
    idle_delta = idle2 - idle1
    total_delta = total2 - total1
    cpu_percent = ((total_delta - idle_delta) / total_delta) * 100
    ```
  - The module must store the previous reading to calculate deltas
  - First reading after startup will have no previous data — skip or return 0

  **Memory — `/proc/meminfo`**:
  - Read and parse key-value lines:
    - `MemTotal`: total physical memory
    - `MemAvailable`: available memory (preferred over calculating from Free+Buffers+Cached)
  - `used = MemTotal - MemAvailable`
  - Values are in kB — convert to MB (divide by 1024)

  **Network — `/proc/net/dev`**:
  - Skip first 2 header lines
  - Each line: `interface: rx_bytes rx_packets ... tx_bytes tx_packets ...`
  - Sum `rx_bytes` and `tx_bytes` across all non-loopback interfaces (skip `lo`)
  - Like CPU, network is cumulative — need delta between two readings
  - Calculate rate: `(bytes_delta / interval_seconds) / 1024` for KB/s
  - Store previous reading for delta calculation

  **Disk — Node.js `fs.statfs` or shell `df`**:
  - Use Node.js built-in `fs.statfs('/')` (available since Node 18.15) to get filesystem stats for root mount
  - Calculate: `total = blocks * bsize`, `free = bfree * bsize`, `used = total - free`
  - Convert bytes to GB (divide by 1024^3)
  - Alternative: parse output of `df -B1 /` if `fs.statfs` is unavailable

- **Depends on**: None

### Step 2: Implement CPU Metric Collection

- **What**: Function that reads `/proc/stat`, calculates CPU usage %, and returns a metric object
- **Where**: Collector module in `apps/api`
- **Details**:
  - Maintain a module-level variable for the previous CPU tick values
  - On each call:
    1. Read `/proc/stat` first line
    2. Parse the space-separated tick values
    3. If previous values exist, calculate delta and derive percentage
    4. Store current values as previous for next cycle
    5. Return: `{ type: 'CPU', value: cpuPercent, unit: '%' }`
  - Handle first call gracefully (return `null` or `0` — no delta yet)
  - Round to 1 decimal place for clean storage
- **Depends on**: Step 1

### Step 3: Implement Memory Metric Collection

- **What**: Function that reads `/proc/meminfo` and returns used and total memory
- **Where**: Collector module in `apps/api`
- **Details**:
  - Read `/proc/meminfo` and parse `MemTotal` and `MemAvailable` lines
  - Calculate `used = total - available`
  - Convert from kB to MB
  - Return two metric objects:
    - `{ type: 'MEMORY_USED', value: usedMB, unit: 'MB' }`
    - `{ type: 'MEMORY_TOTAL', value: totalMB, unit: 'MB' }`
  - No delta calculation needed — these are point-in-time values
- **Depends on**: Step 1

### Step 4: Implement Network Metric Collection

- **What**: Function that reads `/proc/net/dev`, calculates network throughput rates
- **Where**: Collector module in `apps/api`
- **Details**:
  - Read `/proc/net/dev`, skip headers, parse each interface line
  - Sum `rx_bytes` (column 1 after interface name) and `tx_bytes` (column 9) across all non-`lo` interfaces
  - Maintain module-level variable for previous byte totals and timestamp
  - Calculate rate: `delta_bytes / delta_seconds / 1024` = KB/s
  - Return two metric objects:
    - `{ type: 'NETWORK_IN', value: rxRate, unit: 'KB/s' }`
    - `{ type: 'NETWORK_OUT', value: txRate, unit: 'KB/s' }`
  - Handle first call (no previous reading) — return `null` or `0`
  - Handle counter wrap (unlikely in 15s but good practice): if delta is negative, skip that cycle
- **Depends on**: Step 1

### Step 5: Implement Disk Metric Collection

- **What**: Function that reads root filesystem disk usage
- **Where**: Collector module in `apps/api`
- **Details**:
  - Use `fs.promises.statfs('/')` to get filesystem stats for the root mount
  - Calculate:
    - `totalGB = (stat.blocks * stat.bsize) / (1024 ** 3)`
    - `freeGB = (stat.bfree * stat.bsize) / (1024 ** 3)`
    - `usedGB = totalGB - freeGB`
  - Return two metric objects:
    - `{ type: 'DISK_USED', value: usedGB, unit: 'GB' }`
    - `{ type: 'DISK_TOTAL', value: totalGB, unit: 'GB' }`
  - Round to 1 decimal place
  - Note: Disk values change slowly — but we collect at the same interval for consistency
- **Depends on**: None (uses Node.js built-in, not `/proc`)

### Step 6: Create the Metric Collector (Orchestrator)

- **What**: A single `collectMetrics()` function that calls all individual collectors and persists results to the database
- **Where**: Collector module in `apps/api`
- **Details**:
  - Call all metric functions from Steps 2-5
  - Filter out `null` results (first-cycle delta metrics)
  - Add a shared `timestamp` to all metrics in the same cycle (ensures consistent time grouping)
  - Use Prisma `createMany()` to batch-insert all metrics in one DB call:
    ```
    prisma.systemMetric.createMany({
      data: metrics.map(m => ({
        type: m.type,
        value: m.value,
        unit: m.unit,
        timestamp: cycleTimestamp
      }))
    })
    ```
  - Wrap in try-catch — log errors but never crash the app. A failed collection cycle is acceptable; crashing the server is not.
  - Log collection summary at debug level (e.g., "Collected 7 metrics in 4ms")
- **Depends on**: Steps 2, 3, 4, 5

### Step 7: Create the Scheduler

- **What**: Start the metric collection on app boot using `setInterval`
- **Where**: App initialization in `apps/api` (where Express server starts)
- **Details**:
  - After Express server starts listening, call:

    ```
    const COLLECTION_INTERVAL = 15_000 // 15 seconds

    // Run first collection immediately (but skip delta metrics on first run)
    collectMetrics()

    // Then schedule recurring collection
    const intervalId = setInterval(collectMetrics, COLLECTION_INTERVAL)
    ```

  - Store `intervalId` for graceful shutdown:
    ```
    process.on('SIGTERM', () => {
      clearInterval(intervalId)
      // ... close server, disconnect Prisma
    })
    process.on('SIGINT', () => {
      clearInterval(intervalId)
      // ... close server, disconnect Prisma
    })
    ```
  - The first call primes the delta-based metrics (CPU, network) — they'll return real values starting from the second cycle
  - Do NOT use `setInterval` before the server is ready — the collector needs Prisma to be connected

- **Depends on**: Step 6

### Parallel Work

- **Can run in parallel**: Steps 2, 3, 4, 5 (independent metric collectors once Step 1 provides the `/proc` reader)
- **Sequential chain**: Step 1 (reader) → Steps 2-5 (individual collectors, parallel) → Step 6 (orchestrator) → Step 7 (scheduler)

## API Changes

_No API changes required._ This task is the data collection layer only. The Dashboard API task will add REST endpoints to query this data.

## Database Changes

_No database changes required._ The `SystemMetric` model and indexes are already defined and migrated. The type discriminators (`CPU`, `MEMORY_USED`, etc.) are application-level conventions stored in the existing `type` String field.

## Key Decisions

| Decision                | Choice                                      | Reference                 |
| ----------------------- | ------------------------------------------- | ------------------------- |
| System data source      | Direct `/proc` reading (no libraries)       | Decided 2026-02-18        |
| Development environment | Directly on Raspberry Pi                    | Decided 2026-02-18        |
| Metric storage model    | Multi-row with specific type discriminators | Decided 2026-02-18        |
| Collection scheduler    | `setInterval` in Express process            | Decided 2026-02-18        |
| Collection interval     | 15 seconds                                  | Decisions.md (2026-02-09) |
| Data retention          | 14 days                                     | Decisions.md (2026-02-09) |
| Database engine         | PostgreSQL via Prisma                       | Decisions.md (2026-02-09) |

## Subtask Breakdown

No subtasks have been created yet. Suggested mapping:

| Step      | Suggested Subtask                                        | Status |
| --------- | -------------------------------------------------------- | ------ |
| Step 1    | Create `/proc` reader module                             | To Do  |
| Steps 2-5 | Implement metric collectors (CPU, memory, network, disk) | To Do  |
| Step 6    | Create metric collector orchestrator                     | To Do  |
| Step 7    | Create metric scheduler with graceful shutdown           | To Do  |

Note: Steps 2-5 could be one subtask (all metric collectors) or four separate subtasks depending on preferred granularity. One combined subtask is simpler since they follow the same pattern.

## Testing Considerations

- **`/proc/stat` parsing**: Verify CPU percentage is between 0-100%. Run two cycles and confirm the second returns a real value (first may be 0 due to no delta).
- **`/proc/meminfo` parsing**: Verify `MEMORY_USED + (MemAvailable)` roughly equals `MEMORY_TOTAL`. Values should be in reasonable MB range for the Pi (e.g., total ~1024-8192 MB).
- **`/proc/net/dev` parsing**: Verify rates are non-negative. Generate some network traffic (e.g., `curl`) and confirm values increase. Verify `lo` interface is excluded.
- **Disk metrics**: Verify `DISK_USED + free` roughly equals `DISK_TOTAL`. Values should match `df -h /` output.
- **Database persistence**: After 2-3 cycles, query `SystemMetric` table directly and verify rows exist with correct types, reasonable values, and timestamps ~15s apart.
- **Error resilience**: Temporarily make a `/proc` file unreadable — verify the collector logs an error but doesn't crash the Express server.
- **Graceful shutdown**: Send SIGTERM to the process — verify the interval is cleared and Prisma disconnects cleanly (no "operation interrupted" errors).
- **First cycle behavior**: On app start, delta-based metrics (CPU, network) should either be skipped or return 0. By the second cycle (15s later), all metrics should have real values.

## Notes

- **Delta-based metrics** (CPU, network): These require two readings to compute meaningful values. The first reading after app start is just a baseline — store it but don't persist a metric. Real values start from the second cycle onward.
- **Network interface selection**: Summing all non-`lo` interfaces is simplest. If the Pi has multiple physical interfaces (eth0 + wlan0), this gives total throughput. If the user later wants per-interface breakdown, the collector can be extended.
- **Disk collection scope**: For Phase One, collecting root filesystem (`/`) is sufficient. Storage mounts (NAS, external drives) are handled separately by the `/api/storage/mounts` endpoint which reads mount info on demand, not on a timer.
- **Logging**: Use a lightweight approach — `console.log` for startup/shutdown, `console.error` for failures. Avoid logging every successful cycle in production (would flood logs at 4 per minute). Consider a debug flag or log level.
- **Memory of previous readings**: CPU and network delta calculations require storing previous values in module-level variables. These are lost on app restart, which is fine — the first cycle after restart just re-primes the baseline.
- **`createMany` vs individual creates**: `createMany` is a single SQL INSERT with multiple value sets — significantly more efficient than 7 individual INSERTs per cycle. Prisma supports this on PostgreSQL.

## Revision History

| Date       | Change                | Reason |
| ---------- | --------------------- | ------ |
| 2026-02-18 | Initial guide created | —      |
