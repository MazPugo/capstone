Healthchecks & Startup Ordering

This document explains how healthchecks were implemented for each service in The EpicBook production deployment, and how depends_on with health conditions ensures the correct startup order inside Docker Compose.


1. Why Healthchecks Matter

Healthchecks allow Docker to automatically verify if a service is healthy and ready to accept traffic.

Benefits:

Ensures the database fully starts before backend initializes Sequelize.

Ensures the backend is actually responding before Traefik routes traffic to it.

Enables automatic container restarts when unhealthy.

Prevents race conditions such as “ECONNREFUSED: database not ready”.

2. Database Healthcheck (MySQL)

MySQL can accept TCP connections before it is fully ready.
To avoid backend initialization errors, we added this healthcheck:

healthcheck:
  test: ["CMD-SHELL", "mysqladmin ping -h localhost -uroot -p$MYSQL_ROOT_PASSWORD || exit 1"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 20s

This waits until MySQL responds with:
mysqld is alive

Only then is the service considered healthy.

3. Backend Healthcheck (Node.js)

The backend exposes a /health endpoint:

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});


Healthcheck defined in Compose:

healthcheck:
  test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/health"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 10s


This ensures Express is responding before other services attempt to use it.

4. Startup Order Using depends_on

Docker Compose v3 supports health-based conditions:

Backend waits for MySQL:
depends_on:
  db:
    condition: service_healthy

Meaning:

Backend will not start until MySQL is fully ready.

Prevents Sequelize connection failures.

Traefik waits for backend:
depends_on:
  backend:
    condition: service_healthy


Meaning:

Traefik does not try to route traffic to a failing backend.

Avoids 502/504 errors at startup.

5. Final Startup Sequence

MySQL starts → healthcheck waits for it to be ready.

Backend starts → waits until DB is healthy.

Backend exposes /health → becomes healthy.

Traefik starts → waits for backend to be healthy.

Public traffic flows only after all services are marked healthy.

This results in a stable, predictable stack startup with no race conditions.

6. Verification Steps

To confirm healthchecks work:

Check container status
docker ps


Healthy containers show:

(healthy)

Test backend from inside Traefik
docker exec -it traefik wget -qO- http://backend:3000/health


Expected output:

OK

Conclusion

Healthchecks and depends_on significantly improve reliability by:

Controlling startup order

Ensuring dependent services are ready

Reducing container restart loops

Eliminating early-boot errors

This is a key part of building a production-ready, resilient containerized system.
