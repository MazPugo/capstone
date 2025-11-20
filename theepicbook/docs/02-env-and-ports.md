# 02 — Environment Variables & Ports

This document summarizes the key environment variables and ports used in The EpicBook deployment.

## 1. Environment Variables (.env)

File: `.env` in the `capstone` folder.

- `MYSQL_DATABASE=epicbook`  
  - Name of the MySQL database used by the app.

- `MYSQL_USER=epicuser`  
  - Application DB user.

- `MYSQL_PASSWORD=epicpass`  
  - Password for `epicuser`.

- `MYSQL_ROOT_PASSWORD=rootpass`  
  - Root password for initial DB setup and manual administration.

- `DB_HOST=db`  
  - Hostname of the DB inside Docker (service name).

- `NODE_ENV=production`  
  - Runs Node.js in production mode.

## 2. Ports

- **Traefik (reverse proxy)**  
  - External: `80` (HTTP)  
  - Internal: forwards to `backend:3000`

- **Backend (Node/Express)**  
  - Internal only: `3000` (exposed to Docker networks, not to the Internet)  
  - Traefik routes all traffic to this port.

- **MySQL**  
  - Internal: `3306`  
  - Not exposed publicly; only reachable on the `backend_net` network.

## 3. Public Entry

Users access the app via:

- `http://<PUBLIC_IP>/` (port 80 → Traefik → backend → DB)
