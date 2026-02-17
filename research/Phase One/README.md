# Phase One

This folder contains all documentation and files related to Phase One of the project.

## Contents

# Server Management System

## Overview

This project is a **server management and monitoring system** designed for a **single Raspberry Pi server** accessed by **multiple users**.

The system focuses on **safe, read-only observability** in Phase One.

It provides visibility into system health, running workloads, and storage usage without allowing any destructive actions.

---

## Core Principles

- Observability first

- Control comes later

- Safety over convenience

- Explicit scope boundaries

---

## Phase One Summary (MVP)

Phase One provides **monitoring only**.

### Included in Phase One

- Multi-user login with role-based access

- System health dashboard (CPU, memory, network)

- Process monitoring (read-only)

- Service monitoring (read-only)

- Docker monitoring (read-only)

- Node.js application monitoring

- Storage and NAS visibility

- Persisted logs and metrics

- Simple notifications

### Explicitly Excluded from Phase One

- Process control

- Service control

- Docker lifecycle management

- System configuration changes

- Automation or orchestration

---

## Project Documentation

This repository uses **separate documents for clarity**:

- `PROJECT_REQUIREMENTS.md`

Defines **what the system does** and strict Phase One vs Phase Two boundaries.

- `TECH_STACK.md`

Defines **which technologies are used** and their responsibilities.

- `UI_REQUIREMENTS.md` (planned)

Will define UI structure and behavior.

Additional documents may be added as the project evolves.

---

## Target Environment

- Hardware: Raspberry Pi

- OS: Linux-based

- Deployment: Single-machine, local deployment

- Users: Multiple concurrent users

---

## Intended Audience

- Developers working on the project

- AI agents assisting with development

- Technical users monitoring a home or lab server

---

## Development Status

- Phase One: In active development

- Phase Two: Planning only

---

## Guiding Principle

> Make the system observable before making it powerful.
