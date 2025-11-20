# 10 — Reliability Tests

This document records the basic reliability tests performed on The EpicBook deployment.

## 1. Test 1 — Restart Backend Only

**Procedure:**

- Restart `backend` container while keeping `db` and `traefik` running.
- Refresh the UI during restart.

**Expected:**

- Short disruption while backend restarts.
- After restart, homepage loads again and books are visible.

**Actual:**

- During restart, requests briefly failed.
- Once `backend` reported `healthy` again, the UI recovered automatically.

## 2. Test 2 — Take Database Down

**Procedure:**

- Stop the `db` container.
- Observe backend and healthchecks.

**Expected:**

- Backend healthcheck fails.
- App may show errors if accessed.
- Traefik may stop routing if backend is unhealthy.

**Actual:**

- `db` stopped.
- Backend logs showed DB errors.
- Healthcheck failed, and Compose marked it unhealthy.
- After restarting `db`, backend returned to healthy and app worked again.

## 3. Test 3 — Full Stack Bounce

**Procedure:**

- Run `docker-compose down`.
- Then `docker-compose up -d --build`.

**Expected:**

- All containers start cleanly.
- Data (books, cart, etc.) still present thanks to volumes/DB persistence.

**Actual:**

- `db`, `backend`, and `traefik` started successfully.
- Volumes preserved MySQL data.
- Books were still visible on the homepage after restart.

## 4. Conclusion

The stack can tolerate:

- Individual backend restarts.
- DB restarts with recovery.
- Full stack tear down and bring-up without data loss.

This meets the capstone reliability expectations for a single-node VM deployment.
