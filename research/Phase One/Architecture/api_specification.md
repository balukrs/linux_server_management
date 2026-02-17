# Phase One — API Specification

## Overview

_This document defines all REST API endpoints for Phase One. All endpoints are read-only except authentication and user management._

---

## Status: Active

---

## Base URL

```
http://<raspberry-pi-ip>:<port>/api
```

---

## Authentication

All endpoints except `/auth/login` and `/auth/signup` require authentication.

**Auth method:** JWT with HTTP-only cookies. Access and refresh tokens are set as `httpOnly`, `secure`, `sameSite=strict` cookies. No tokens are returned in the response body.

### Endpoints

#### POST /auth/login

Authenticate user. Sets JWT cookies on success.

**Request:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
Sets `accessToken` and `refreshToken` as HTTP-only cookies.

```json
{
  "user": {
    "id": "string",
    "username": "string",
    "role": "ADMIN | VIEWER"
  }
}
```

#### POST /auth/logout

Clear JWT cookies.

#### GET /auth/me

Get current authenticated user.

---

## Dashboard

#### GET /dashboard/summary

Get overall server status summary.

**Response:**

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

#### GET /dashboard/metrics?type={cpu|memory|network}&period={1h|6h|24h|7d}

Get historical metrics for charts.

**Response:**

```json
{
  "type": "cpu",
  "period": "24h",
  "data": [
    { "timestamp": "2026-02-03T10:00:00Z", "value": 45.2 },
    { "timestamp": "2026-02-03T10:05:00Z", "value": 48.1 }
  ]
}
```

---

## Processes

#### GET /processes

List all running processes.

**Response:**

```json
{
  "processes": [
    {
      "pid": 1234,
      "name": "node",
      "cpuPercent": 2.5,
      "memoryMB": 128,
      "uptime": 3600,
      "user": "pi"
    }
  ]
}
```

---

## Services

#### GET /services

List system services.

**Response:**

```json
{
  "services": [
    {
      "name": "jellyfin",
      "status": "running",
      "uptime": 86400,
      "enabled": true
    }
  ]
}
```

---

## Docker

#### GET /docker/containers

List Docker containers.

**Response:**

```json
{
  "containers": [
    {
      "id": "abc123",
      "name": "my-container",
      "image": "nginx:latest",
      "state": "running",
      "cpuPercent": 1.2,
      "memoryMB": 64,
      "storageMB": 256
    }
  ]
}
```

#### GET /docker/containers/:id/metrics?period={1h|6h|24h|7d}

Get historical metrics for a container.

#### GET /docker/storage

Get Docker storage breakdown.

**Response:**

```json
{
  "images": { "count": 5, "sizeMB": 2048 },
  "volumes": { "count": 3, "sizeMB": 512 },
  "containers": { "count": 4, "sizeMB": 128 },
  "total": { "sizeMB": 2688 }
}
```

---

## Node.js Servers

#### GET /nodejs/servers

List Node.js servers running on the machine.

**Response:**

```json
{
  "servers": [
    {
      "pid": 5678,
      "port": 3000,
      "uptime": 7200,
      "cpuPercent": 3.5,
      "memoryMB": 96
    }
  ]
}
```

#### GET /nodejs/servers/:pid/metrics?period={1h|6h|24h|7d}

Get historical metrics for a Node.js server.

---

## Storage

_Note: Storage data is displayed on the Dashboard (no separate Storage page)._

#### GET /storage/mounts

List all mounted storage. Used by Dashboard.

**Response:**

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

---

## Logs

#### GET /logs/system?limit={n}&level={info|warn|error}

Get system logs.

#### GET /logs/application?limit={n}&source={string}

Get application logs.

**Response:**

```json
{
  "logs": [
    {
      "id": "uuid",
      "timestamp": "2026-02-03T10:00:00Z",
      "level": "ERROR",
      "source": "nodejs",
      "message": "Connection refused"
    }
  ]
}
```

---

## Notifications

#### GET /notifications?read={true|false}

List notifications.

#### PATCH /notifications/:id/read

Mark notification as read.

---

## Users (Admin only)

#### GET /users

List all users.

#### POST /users

Create new user.

#### DELETE /users/:id

Delete user.

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials"
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` — 401
- `FORBIDDEN` — 403
- `NOT_FOUND` — 404
- `VALIDATION_ERROR` — 400
- `SERVER_ERROR` — 500
