# 06 — Logging & Observability Layout

This document describes how logs are handled for The EpicBook stack.

## 1. Reverse Proxy Logs (Traefik)

- Traefik container writes access and internal logs.
- Logs are persisted to a bind mount:

  - Host: `./proxy/logs`
  - Container: `/logs`

- This allows:
  - Log review on the VM without entering the container.
  - Inclusion in future log shippers (e.g., Fluent Bit, Loki, etc.).

## 2. Application Logs (Backend)

- The Node.js/Express backend logs to **stdout** using `console.log(...)`.
- Docker captures these logs and they are accessible with:

  - `docker logs backend`

- Rationale:
  - Works well with containerized environments.
  - Easy to integrate later with log forwarders or centralized logging.

## 3. Database Logs

- MySQL logs remain inside the `db` container and can be accessed via:

  - `docker logs db`

- For this capstone, they are not shipped externally, but can be inspected for troubleshooting.

## 4. Structured Logging

- Where possible, logs follow a simple structured pattern:

  - `"App listening on PORT 3000"`
  - Healthcheck hits on `/health`
  - Sequelize startup / table creation messages.

- Future improvement:
  - Convert app logs to JSON format and send to a central system (e.g., ELK, Loki, Datadog).

## 5. Observability

- Basic health is monitored via:
  - Docker healthchecks (db + backend)
  - Manual commands:
    - `docker ps` (status)
    - `docker logs <service>` (runtime logs)
- This meets the capstone requirement for logging layout and basic observability.

