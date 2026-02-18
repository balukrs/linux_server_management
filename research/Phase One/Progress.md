# Phase One — Progress

## Status: Development

---

## Overdue / Needs Attention

> Tasks past their due date or blocked items.

```dataview
TABLE
  status AS "Status",
  priority AS "Priority",
  due_date AS "Due Date"
FROM "tasks"
WHERE project = "Phase One"
  AND status != "Done"
  AND due_date != null
  AND due_date < date(today)
SORT due_date ASC
```

---

## In Progress

```dataview
TABLE
  priority AS "Priority",
  due_date AS "Due Date"
FROM "tasks"
WHERE project = "Phase One" AND status = "In Progress"
SORT priority ASC, due_date ASC
```

---

## Up Next (To Do)

> Prioritized by priority level, then by due date.

```dataview
TABLE
  priority AS "Priority",
  due_date AS "Due Date"
FROM "tasks"
WHERE project = "Phase One" AND status = "To Do"
SORT choice(priority = "High", 1, choice(priority = "Medium", 2, 3)) ASC, due_date ASC
LIMIT 10
```

---

## Recently Completed

```dataview
TABLE
  priority AS "Priority",
  due_date AS "Completed By"
FROM "tasks"
WHERE project = "Phase One" AND status = "Done"
SORT due_date DESC
LIMIT 5
```

---

## Task Summary

### Tasks

```dataview
TABLE WITHOUT ID
  length(filter(rows, (r) => r.status = "Done")) AS "Done",
  length(filter(rows, (r) => r.status = "In Progress")) AS "In Progress",
  length(filter(rows, (r) => r.status = "To Do")) AS "To Do",
  length(rows) AS "Total"
FROM "tasks"
WHERE project = "Phase One"
GROUP BY true
```

### Subtasks

```dataview
TABLE WITHOUT ID
  length(filter(rows, (r) => r.status = "Done")) AS "Done",
  length(filter(rows, (r) => r.status = "In Progress")) AS "In Progress",
  length(filter(rows, (r) => r.status = "To Do")) AS "To Do",
  length(rows) AS "Total"
FROM "subtasks"
WHERE project = "Phase One"
GROUP BY true
```

---

## Recent Updates

### 2026-02-18

- Completed: [[Define Shared Types Package]]

### 2026-02-17

- Completed: [[Backend Authentication & Authorization]]
- Completed: [[Add RefreshToken model and migrate]]
- Completed: [[Create auth middleware + requireAdmin]]
- Completed: [[Create auth utilities (hash, JWT, cookies)]]
- Completed: [[Implement GET _api_auth_me]]
- Completed: [[Implement POST _api_auth_login]]
- Completed: [[Implement POST _api_auth_logout]]
- Completed: [[Implement POST _api_auth_signup]]
- Completed: [[Register routes and apply middleware]]

### 2026-02-13

- Completed: [[Set Up Database (PostgreSQL + Prisma)]]
- Completed: [[Implement Prisma schema models and indexes]]
- Completed: [[Run initial migration]]
- Completed: [[Create seed script (default admin user)]]
- Completed: [[Set up data retention cleanup job]]

### 2026-02-09

- Completed: [[Resolve Pending Architecture Decisions]]
- Completed: [[UI Components]]
- Completed: [[403 page]]
- Completed: [[Notification]]
- Completed: [[PageShell-Table]]
- Completed: [[Profile]]

### 2026-02-08

- Completed: [[Dashboard]]
- Completed: [[Layout]]

### 2026-02-07

- Completed: [[Auth Pages]]

### 2026-02-06

- Monorepo initialized with Turborepo + pnpm workspaces
- Frontend scaffolded (React 19 + Vite + TypeScript)
- Backend scaffolded (Express + TypeScript)
- Shared types package created
- Project structure documented in `Architecture/project_structure.md`

### 2026-02-05

- Completed: [[UI Designs]]

### 2026-02-03

- Project structure established
- Architecture folder created
- Progress tracking initiated

---

## Infrastructure Completed

- [x] Monorepo setup (Turborepo + pnpm)
- [x] Frontend project initialization (apps/web)
- [x] Backend project initialization (apps/api)
- [x] Shared types package (packages/shared)
- [x] Dev workflow configured (`pnpm dev` runs both apps)
