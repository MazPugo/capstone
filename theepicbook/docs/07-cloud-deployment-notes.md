# 07 — Cloud Deployment Notes (AWS VM)

## 1. Platform

- **Cloud provider:** AWS
- **VM OS:** Ubuntu (Linux)
- **Deployment model:** Single VM running Docker + Docker Compose.

## 2. Security Groups / Inbound Rules

- **Port 22 (SSH):**
  - Source: my IP only
  - Purpose: Admin access to the VM.

- **Port 80 (HTTP):**
  - Source: 0.0.0.0/0
  - Purpose: Public access to The EpicBook via Traefik.

- **No direct DB or backend exposure:**
  - Ports 3000 and 3306 are **not** exposed publicly.
  - They are only accessible over internal Docker networks.

## 3. Installed Components on the VM

- Docker Engine
- docker-compose
- The EpicBook code under `~/capstone`:
  - `docker-compose.yml`
  - `theepicbook/`
  - `proxy/`
  - `.env`

## 4. Deployment Steps (High Level)

1. Clone the application repo to the VM (`theepicbook`).
2. Create `capstone` folder and move:
   - `docker-compose.yml`
   - `proxy/` config
   - `theepicbook/` app
3. Create `.env` file with DB and app settings.
4. Start the stack:
   - `docker-compose up -d --build`
5. Verify:
   - `docker ps` shows `traefik`, `backend`, `db` as `Up` and healthy.
   - `curl http://localhost/` returns the homepage.

## 5. Public URL

- Access pattern:
  - `http://<EC2_PUBLIC_IP>/`

This URL serves the UI through Traefik, which routes traffic to the backend and then the database.
