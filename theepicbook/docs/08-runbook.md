# 09 — Operations Runbook (The EpicBook)

This runbook describes common operational tasks for running The EpicBook in production.

## 1. Start / Stop / Restart the Stack

- **Start (or restart) the full stack:**
  - From `~/capstone`:
    - `docker-compose up -d --build`

- **Stop the stack:**
  - `docker-compose down`

## 2. Checking Service Health

- List containers and health:

  - `docker ps`

- Backend health endpoint (from VM):

  - `curl http://localhost/health`

- Traefik → backend health (inside Traefik):

  - `docker exec -it traefik wget -qO- http://backend:3000/health`

## 3. Logs & Debugging

- **Backend logs:**
  - `docker logs backend`

- **Traefik logs:**
  - `docker logs traefik`
  - Or inspect files under `proxy/logs/`.

- **Database logs:**
  - `docker logs db`

If the app is not responding:

1. Check `docker ps` for `Restarting` or `Exited` states.
2. Inspect logs for errors (DB connection, migration issues, etc.).

## 4. Rollback Procedure

If a new deployment breaks the app:

1. Stop the stack:
   - `docker-compose down`
2. Check out previous known-good commit / image version.
3. Rebuild and start:
   - `docker-compose up -d --build`
4. Confirm health endpoints and UI before allowing users to access.

## 5. Rotating Secrets

1. Edit `.env` with new passwords or API keys.
2. Restart the stack:
   - `docker-compose down`
   - `docker-compose up -d`
3. For DB password changes:
   - Update MySQL user password inside the DB first.
   - Then update `.env` to match.

## 6. Backup / Restore

- Backup:
  - Use `mysqldump` against the `db` container to dump the `epicbook` database into a `.sql` file on the host.

- Restore:
  - Import the `.sql` file back into the `epicbook` database via the `db` container.

(Full details are in `05-persistence-and-backup.md`.)

## 7. Common Errors & Fixes

- **Error:** “Cannot connect to database”
  - Check DB container is `Up (healthy)`.
  - Ensure `DB_HOST=db` and credentials in `.env` match MySQL.

- **Error:** Homepage shows “no books available”
  - Check DB contains data:
    - Connect to MySQL and `SELECT * FROM Book;`
  - Ensure migrations/seed logic has run.

- **Error:** `504 Gateway Timeout`
  - Traefik cannot reach backend.
  - Check `backend` health and labels in `docker-compose.yml`.

This runbook is intended for day-2 operations: starting, stopping, troubleshooting, and recovering the stack.
