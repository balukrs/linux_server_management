# Phase One — Database Schema

## Overview

_This document defines the Prisma models for Phase One. All models are read-only from the application perspective in Phase One (except user creation by admin)._

---

## Status: Active

- **Database engine:** PostgreSQL
- **Data retention:** 14 days
- **Metric collection interval:** 15 seconds

---

## Models

### User

```prisma
model User {
  id        String   @id @default(uuid())
  username  String   @unique
  password  String   // hashed
  role      Role     @default(VIEWER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  activityLogs   ActivityLog[]
  refreshTokens  RefreshToken[]
}

enum Role {
  ADMIN
  VIEWER
}
```

### ActivityLog

```prisma
model ActivityLog {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String   // e.g., "LOGIN", "PAGE_VIEW"
  details   String?  // e.g., page path, additional context
  timestamp DateTime @default(now())
}
```

### SystemMetric

```prisma
model SystemMetric {
  id        String   @id @default(uuid())
  type      String   // "CPU", "MEMORY", "NETWORK"
  value     Float
  unit      String   // "%", "MB", "KB/s"
  timestamp DateTime @default(now())
}
```

### DockerMetric

```prisma
model DockerMetric {
  id            String   @id @default(uuid())
  containerId   String
  containerName String
  cpuPercent    Float
  memoryUsage   Float    // in MB
  memoryLimit   Float    // in MB
  timestamp     DateTime @default(now())
}
```

### NodeServerMetric

```prisma
model NodeServerMetric {
  id           String   @id @default(uuid())
  processId    Int
  port         Int
  cpuPercent   Float
  memoryUsage  Float    // in MB
  requestCount Int      @default(0)
  timestamp    DateTime @default(now())
}
```

### Notification

```prisma
model Notification {
  id        String   @id @default(uuid())
  type      String   // "SERVICE_STOPPED", "DISK_UNAVAILABLE", "USER_LOGIN", etc.
  message   String
  severity  String   @default("INFO") // "INFO", "WARNING"
  read      Boolean  @default(false)
  timestamp DateTime @default(now())
}
```

### SystemLog

```prisma
model SystemLog {
  id        String   @id @default(uuid())
  source    String   // "SYSTEM", "APPLICATION", "NODEJS"
  level     String   // "INFO", "WARN", "ERROR"
  message   String
  timestamp DateTime @default(now())
}
```

### RefreshToken

```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([token])
  @@index([userId])
  @@index([expiresAt])
}
```

### AccessCode

```prisma
model AccessCode {
  id        String   @id @default(uuid())
  code      String   @unique
  email     String
  role      Role     @default(VIEWER)
  used      Boolean  @default(false)
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

---

## Indexes (Performance)

_To be defined based on query patterns:_

```prisma
// Example indexes for time-series queries
@@index([timestamp])
@@index([type, timestamp])
@@index([containerId, timestamp])
```

---

## Retention Policy

- Metrics older than **14 days** are automatically deleted
- Cleanup runs as a scheduled job (cron or application-level)
- At 15-second intervals: ~80,640 rows per metric retained
- Activity logs may have different retention than metrics

---

## Notes

- All IDs use UUID for portability
- Timestamps use UTC
- Passwords are hashed (bcrypt recommended)
- Schema will be managed via Prisma migrations
