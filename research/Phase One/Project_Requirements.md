# Server Management System – Project Requirements

## DOCUMENT PURPOSE

This document defines:

- The exact scope of Phase One (MVP)
- The planned scope of Phase Two (NOT implemented)

This document is intended for:

- Human developers
- Automated AI agents

Any feature not explicitly listed under Phase One MUST be considered out of scope.

---

## SYSTEM CONTEXT

- Target system: Single Raspberry Pi server
- Access model: Multiple users
- Primary function: Monitoring and observability
- Control actions: NOT allowed in Phase One
- Data persistence: ENABLED in Phase One

---

## PHASE ONE – IMPLEMENTATION SCOPE (MVP)

### PHASE ONE GOAL

Provide safe, read-only observability with persisted data.

---

## 1. USER & ACCESS MANAGEMENT (PHASE ONE)

- Multi-user login
- Role types:
  - Admin
  - Viewer
- All roles are read-only
- Persisted user activity:
  - Login events
  - Page access events

---

## 2. DASHBOARD (PHASE ONE)

At-a-glance view of server health.

### Metrics

- Overall server status
- CPU usage:
  - Live value
  - Time-based chart (persisted)
- Memory usage:
  - Live value
  - Time-based chart (persisted)
- Network usage:
  - Live value
  - Time-based chart (persisted)
- Disk usage:
  - Current values only
  - No historical charts

---

## 3. PROCESS MONITORING (PHASE ONE – READ-ONLY)

- List of running processes
- Per-process data:
  - CPU usage
  - Memory usage
  - Uptime
- No process control

---

## 4. SERVICE MONITORING (PHASE ONE – READ-ONLY)

- List of system services
- Per-service data:
  - Status
  - Uptime
- Includes media services (e.g., Jellyfin)
- No service control

---

## 5. DOCKER MONITORING (PHASE ONE – READ-ONLY)

- List of Docker containers
- Per-container data:
  - State
  - CPU usage (live + persisted chart)
  - Memory usage (live + persisted chart)
  - Storage usage (current size only)
- Total Docker storage usage:
  - Images
  - Volumes
  - Containers
- No Docker control actions

---

## 6. NODE.JS SERVER MONITORING (PHASE ONE)

- List of Node.js servers
- Per server:
  - Port
  - Process ID
  - Uptime
  - CPU usage
  - Memory usage
  - Request activity (persisted)

---

## 7. STORAGE & NAS MONITORING (PHASE ONE)

Storage includes all mounted sources:

- Internal storage
- External drives
- NAS mounts (NFS / SMB)

Per mount:

- Total size
- Used space
- Free space
- Mount status

No historical storage charts.

**UI Note:** Storage information is displayed on the Dashboard (no separate page).

---

## 8. LOGS & ACTIVITY (PHASE ONE)

Persisted data:

- System logs (read-only)
- Application / Node.js logs (read-only)
- User activity logs

---

## 9. NOTIFICATIONS (PHASE ONE)

Notifications are simple, informational, and persisted.

Examples:

- Node.js server stopped
- Service stopped
- Disk mount unavailable
- User login

No alert rules, no thresholds, no automated actions.

---

## PHASE TWO – PLANNED FEATURES (NOT IMPLEMENTED)

All features below are explicitly excluded from Phase One.

### PROCESS CONTROL

- Kill / restart processes

### SERVICE CONTROL

- Start / stop / restart services

### DOCKER CONTROL

- Container lifecycle actions
- Storage cleanup

### STORAGE MANAGEMENT

- Disk cleanup
- NAS mount management

### ADVANCED ANALYTICS

- Long-term metric history
- Disk I/O charts
- Anomaly detection

### SECURITY & PERMISSIONS

- Fine-grained authorization
- Action confirmations

---

## SUCCESS CRITERIA (PHASE ONE)

Phase One is successful if:

- Multiple users can monitor the server safely
- Historical data improves visibility
- No destructive action is possible

---

## GUIDING PRINCIPLE

Observability first. Control later.

END OF DOCUMENT
