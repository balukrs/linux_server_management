# Phase One — Architecture

## Overview

_This document describes the system architecture, component relationships, and data flow for Phase One._

---

## System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Raspberry Pi                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Frontend  │───▶│   Backend   │───▶│  Database   │     │
│  │  (React)    │◀───│  (Express)  │◀───│(PostgreSQL) │     │
│  │             │    │             │    │             │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                            │                                │
│                            ▼                                │
│                    ┌─────────────┐                         │
│                    │   System    │                         │
│                    │  (Linux OS) │                         │
│                    └─────────────┘                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Responsibilities

### Frontend (React + Vite + TypeScript)

- Render monitoring dashboards
- Display real-time and historical data
- Handle user authentication state
- Reflect user permissions (does not enforce)

### Backend (Express + TypeScript + Prisma)

- REST API server
- WebSocket server for real-time metric streaming
- Authentication & authorization enforcement (JWT with HTTP-only cookies)
- System data collection (15-second intervals)
- Data persistence
- Notification generation

### Database (PostgreSQL)

- User & role storage
- Metric history (time-series)
- Activity logs
- Notifications

### System Interface

- CPU, memory, network metrics via Linux interfaces
- Process listing
- Service status (systemctl)
- Docker stats (docker CLI/API)
- Storage/mount information

---

## Data Flow

### 1. Metric Collection Flow

```
Linux System → Backend (collector) → Database (persist) → API → Frontend (display)
```

### 2. Authentication Flow

```
Frontend (login) → Backend (validate) → Database (user lookup) → Backend (set HTTP-only cookie with JWT) → Frontend (authenticated)
```

### 3. Real-time Data Flow

```
Backend (collector, every 15s) → Database (persist) → WebSocket → Frontend (live update)
```

---

## API Structure

_See api_specification.md for detailed endpoints._

### Route Groups

- `/api/auth/*` — Authentication
- `/api/dashboard/*` — Dashboard metrics
- `/api/processes/*` — Process monitoring
- `/api/services/*` — Service monitoring
- `/api/docker/*` — Docker monitoring
- `/api/nodejs/*` — Node.js server monitoring
- `/api/storage/*` — Storage & NAS monitoring
- `/api/logs/*` — Log access
- `/api/notifications/*` — Notifications
- `/api/users/*` — User management (admin)

---

## Security Model

- All routes require authentication (except login)
- Role-based access: Admin, Viewer
- Phase One: All roles are read-only
- Backend enforces authorization
- Frontend reflects but does not enforce permissions

---

## Deployment Architecture

Single-machine deployment:

- All components on one Raspberry Pi
- No external dependencies
- No cloud services
- Local network access only

---

## Resolved Decisions

- [x] Real-time strategy: **WebSocket**
- [x] Metric collection interval: **15 seconds**
- [x] Data retention: **14 days**
- [x] Database: **PostgreSQL**
- [x] Authentication: **JWT with HTTP-only cookies**
