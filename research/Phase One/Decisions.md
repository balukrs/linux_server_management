# Phase One — Decisions Log

This document tracks all architectural and technical decisions for Phase One.

---

## Pending Decisions

_None — all Phase One decisions resolved._

---

## Decided

### 2026-02-18 — Development & Deployment Strategy

**Decision:** Develop directly on the Raspberry Pi (Linux), with Mac as optional verification environment

**Options considered:**

- Develop on Mac with mock `/proc` layer, deploy to Pi for testing — adds abstraction complexity
- Develop directly on Pi (Linux) — real system data from day one, no mocks needed
- Docker-based dev environment — inconsistent across architectures (arm64 vs x86), unnecessary complexity during development

**Rationale:** The goal is to learn how Linux system interfaces work. Developing directly on the Pi means real `/proc` data from the start — no mock layers, no cross-platform abstractions. The monorepo is cloned on the Pi with PostgreSQL installed locally. Mac can be used later to verify frontend/UI work by importing a DB backup. Docker is avoided during development to reduce environment complexity.

**Impact:**

- Full repo cloned on Pi, `pnpm install` and `pnpm dev` to run
- PostgreSQL installed directly on Pi
- Per-machine `.env` files for PORT, DATABASE_URL, etc.
- No mock `/proc` layer needed in the codebase
- DB backup strategy (S3 or similar) to be decided separately for Mac verification
- System metric collection reads real `/proc` files during development

---

### 2026-02-18 — Metric Storage Model

**Decision:** Multi-row flat model with specific type discriminators (no schema change)

**Options considered:**

- Multi-row with sub-typed `type` field (e.g., MEMORY_USED, MEMORY_TOTAL) — no schema change, simple queries
- Add JSON `metadata` field to SystemMetric — flexible but harder to query/index
- Add extra columns (valueSecondary, etc.) — wastes space for single-value metrics

**Rationale:** The existing `SystemMetric` model (`type`, `value`, `unit`, `timestamp`) stays unchanged. Multi-valued metrics (memory used/total, network in/out) are stored as separate rows with specific type discriminators. Each `type` maps directly to one chart line, making time-series queries straightforward (`WHERE type = 'CPU' AND timestamp > ?`). ~5-6 rows per 15-second cycle is negligible overhead.

**Impact:**

- Type values: `CPU`, `MEMORY_USED`, `MEMORY_TOTAL`, `NETWORK_IN`, `NETWORK_OUT`, `DISK_USED`, `DISK_TOTAL`
- ~5-6 rows per collection cycle (every 15 seconds)
- No changes to `db_schema.md` model definition
- Dashboard API queries filter by specific type

---

### 2026-02-18 — Metric Collection Scheduler

**Decision:** `setInterval` inside Express process on app boot

**Options considered:**

- `setInterval` in Express — zero extra memory, negligible CPU, simplest approach
- System cron job — minimum 1-minute granularity, spawns new Node.js process each run (~30-50MB)
- Separate background Node.js process — doubles memory footprint, adds operational complexity
- systemd timer — supports seconds but still spawns a process each invocation

**Rationale:** The Express process is already running. A `setInterval` callback costs essentially nothing in the event loop. Reading `/proc` files is non-blocking microsecond I/O, and one Prisma `createMany` per cycle takes milliseconds. Total work: <10ms every 15 seconds. No reason to add process spawn overhead or operational complexity on a resource-constrained Pi.

**Impact:**

- Collector starts on Express app boot via `setInterval(collectMetrics, 15000)`
- Runs in-process, shares memory with Express
- If Express stops, collection stops (appropriate — no one's viewing data if the app is down)
- No external cron or systemd configuration needed

---

### 2026-02-16 — JWT Token Durations & Refresh Strategy

**Decision:** 1-hour access token, 7-day DB-backed refresh token

**Options considered:**

- 15min access / 7d refresh (stateless JWT) — standard but no revocation
- 1h access / 7d refresh (DB-backed) — less frequent refreshes, revocable
- 1h access / 30d refresh — long session persistence

**Rationale:** 1-hour access token reduces refresh overhead for a small user base (2-3 users). DB-backed refresh tokens enable revocation on logout and password change, which is the preferred security practice. 7-day refresh gives a good session length without being excessive.

**Impact:**

- New `RefreshToken` Prisma model needed
- Auth middleware handles transparent refresh when access token expires
- Logout deletes refresh token from DB
- Expired tokens cleaned up by retention job

---

### 2026-02-09 — Database Engine

**Decision:** PostgreSQL

**Options considered:**

- PostgreSQL — better JSON support, richer feature set, great with Prisma
- MySQL — simpler, lighter on resources

**Rationale:** PostgreSQL offers superior JSON support and a richer feature set that pairs well with Prisma. The slightly heavier footprint is acceptable for a monitoring app with structured metrics data.

**Impact:**

- Prisma provider set to `postgresql`
- Unblocks database schema design and all DB-dependent work

---

### 2026-02-09 — Authentication Method

**Decision:** JWT with HTTP-only cookies

**Options considered:**

- JWT with HTTP-only cookies — secure transport, auto-sent by browser, strong XSS protection
- JWT with Authorization header (Bearer token) — more flexible, but token in localStorage is XSS-vulnerable
- Sessions — server-side state, simpler revocation, requires session store

**Rationale:** JWT keeps auth stateless and fits the API-first monorepo architecture. HTTP-only cookies provide strong XSS protection since JavaScript cannot access the token. With `sameSite=strict` and `secure` flags, CSRF risk is mitigated. Natural fit for same-origin setup where frontend and API share the same domain.

**Impact:**

- Access token + refresh token stored in HTTP-only, secure, sameSite cookies
- Express middleware reads JWT from cookies (not Authorization header)
- No localStorage token management on frontend
- Needs refresh token rotation strategy

---

### 2026-02-09 — Real-time Data Strategy

**Decision:** WebSocket

**Options considered:**

- WebSocket — true real-time, persistent connections, needed for Phase Two control features
- Polling — simpler implementation, slight delay equal to poll interval

**Rationale:** With only 2-3 users on a Raspberry Pi 5, WebSocket connections are trivial resource-wise. Provides instant metric updates. Avoids retrofitting later since Phase Two control features will require WebSocket anyway.

**Impact:**

- WebSocket server (Socket.io or ws) added to Express API
- Frontend connects via WebSocket for live metric streams
- Foundation already in place for Phase Two control commands

---

### 2026-02-09 — Metric Collection Interval

**Decision:** 15 seconds

**Options considered:**

- 5 seconds — very responsive, more storage writes
- 15 seconds — balanced responsiveness and resource usage
- 30 seconds — lower resources, slight delay
- 1 minute — minimal resources, sluggish feel

**Rationale:** 15 seconds provides responsive monitoring without excessive storage writes or CPU load on the Raspberry Pi 5. Good balance between visibility and resource conservation.

**Impact:**

- Collection agent polls system metrics every 15s
- ~5,760 data points per metric per day
- Storage calculations based on 15s granularity

---

### 2026-02-09 — Data Retention Period

**Decision:** 14 days

**Options considered:**

- 7 days — minimal storage, limited trend analysis
- 14 days — good balance of history and storage
- 30 days — full month, more storage

**Rationale:** 14 days provides enough historical context to spot trends and diagnose recurring issues without overwhelming the Pi's storage. Two weeks is a natural review cycle.

**Impact:**

- Automated DB cleanup job purges metrics older than 14 days
- Storage planning based on 14-day window
- At 15s intervals: ~80,640 rows per metric retained

---

### 2026-02-06 — Repository Structure

**Decision:** Monorepo with Turborepo + pnpm workspaces

**Options considered:**

- Monorepo with Turborepo — shared types, fast builds with caching, parallel execution
- Monorepo with pnpm workspaces only — simpler, no build caching
- Separate repos — independent deployment, cleaner boundaries

**Rationale:** Turborepo provides build caching and parallel task execution while pnpm workspaces handle dependency management. Single repo makes sharing TypeScript types between frontend and backend seamless. Aligns with "simple, explicit, maintainable" philosophy while providing room to scale.

**Impact:**

- Project structure: `apps/web`, `apps/api`, `packages/shared`
- Package naming: `@linux-mgmt/*`
- Build commands: `pnpm dev`, `pnpm build`, `pnpm lint`
- See `Architecture/project_structure.md` for full details

### 2026-02-04 — User Registration Flow

**Decision:** Public signup with admin-generated access codes

**Options considered:**

- Admin-only user creation (original spec) — admins create all users via Users page
- Public signup (open) — anyone can register
- Public signup with access codes — controlled public registration

**Rationale:** Access codes provide a balance between convenience and control. Users can self-register without admin doing the work, but registration is still controlled. Codes are tied to specific email addresses for security.

**Impact:**

- New database model: `AccessCode` (code, email, expiry, used)
- New API endpoints: generate code (admin), validate code (signup)
- UI: Signup page with code input, Generate Code modal on Users page

---

### 2026-02-04 — UI Component Stack

**Decision:** Shadcn/ui + Tailwind CSS

**Options considered:**

- Tailwind CSS + Headless UI
- Shadcn/ui (Tailwind + Radix)
- Material UI
- Custom components

**Rationale:** Shadcn/ui provides pre-built, accessible components that integrate well with Tailwind. Includes charts (Recharts) and DataTable (TanStack) as first-party components. Good DX, easy customization, consistent design.

**Impact:** All UI components use Shadcn/ui. Lyra style with Zinc/Stone base colors. Dark mode only.

---

### 2026-02-04 — Navigation Pattern

**Decision:** Collapsible sidebar

**Options considered:**

- Fixed sidebar
- Top navigation bar
- Collapsible sidebar

**Rationale:** Collapsible sidebar works well for dashboards with many navigation items. Provides more space for content when collapsed. Responsive-friendly.

**Impact:** Protected layout uses sidebar for main navigation, header for user actions and notifications.

---

### 2026-02-04 — Storage Page Removed

**Decision:** Display storage/mount information on Dashboard instead of separate page

**Options considered:**

- Separate `/storage` page with full filtering
- Storage card on Dashboard

**Rationale:** Keeps UI minimal. Storage info is static (no historical charts) and doesn't need a full page. Dashboard provides sufficient visibility.

**Impact:**

- Removed `/storage` route from navigation
- Added Storage/Mounts card to Dashboard
- API endpoint `/storage/mounts` unchanged (used by Dashboard)

<!--
Template for decided items:

### [Date] — Decision Title

**Decision:** [What was decided]

**Options considered:**
- Option A — description
- Option B — description

**Rationale:** [Why this choice was made]

**Impact:** [What this affects]
-->
