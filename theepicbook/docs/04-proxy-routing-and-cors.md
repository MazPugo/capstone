Reverse Proxy Routing & CORS Configuration

This document explains how Traefik was configured as the production reverse proxy for The EpicBook application. It covers routing rules, service discovery, and CORS handling to ensure secure and stable communication between the browser frontend, backend API, and the public client.


Reverse Proxy Routing & CORS Configuration

This document explains how Traefik was configured as the production reverse proxy for The EpicBook application. It covers routing rules, service discovery, and CORS handling to ensure secure and stable communication between the browser frontend, backend API, and the public client.

2. Traefik Routing Overview

All external traffic hits Traefik at:

http://<your-public-ip>/


Traefik then forwards traffic internally using Docker service names:

External Route	Internal Target	Notes
/	backend:3000	backend renders HTML views
/cart, /gallery, /api/*	backend:3000	handled by Node/Express


2. Traefik Routing Overview

All external traffic hits Traefik at:

http://<your-public-ip>/


Traefik then forwards traffic internally using Docker service names:

External Route	Internal Target	Notes
/	backend:3000	backend renders HTML views
/cart, /gallery, /api/*	backend:3000	handled by Node/Express

Explanation:
Label	Purpose
traefik.enable=true	Allows Traefik to detect this container
PathPrefix(/)	Routes all traffic to backend
entrypoints=web	Uses port 80 for incoming traffic
loadbalancer.server.port=3000	Backend runs on port 3000 internally
middlewares=cors@file	Attaches CORS middleware defined in /etc/traefik/dynamic


4. Static Traefik Configuration (traefik.yml)
entryPoints:
  web:
    address: ":80"

providers:
  docker:
    exposedByDefault: false
  file:
    directory: "/etc/traefik/dynamic"
    watch: true

api:
  dashboard: true

Notes:

exposedByDefault: false ensures no container is public unless explicitly enabled.

Dynamic config folder (/etc/traefik/dynamic) contains CORS and future middlewares.

Dashboard is enabled but internal and locked behind Docker networks.

5. CORS Configuration (Security & Browser Access)

Browsers require CORS for API calls from frontend → backend.
Because EpicBook frontend is served from the backend itself, we still configure CORS for safety.

Your middleware.yml:

http:
  middlewares:
    cors:
      headers:
        accessControlAllowOriginList:
          - "http://18.134.159.63"
        accessControlAllowMethods:
          - GET
          - POST
          - OPTIONS
        accessControlAllowHeaders:
          - "*"
        accessControlAllowCredentials: true

Why This Is Required

Ensures browsers can load fonts, API calls, and AJAX requests safely.

Prevents CSRF-style cross-domain issues.

Hardening: only your VM’s public IP is allowed.

Optional Upgrade (recommended later)

Replace IP with your domain:

https://my-epicbook.com

6. Networks & Security Isolation

Traefik lives only on the frontend network:

networks:
  - frontend_net


Backend lives on both:

networks:
  - frontend_net
  - backend_net


MySQL only lives on backend_net:

networks:
  - backend_net

Benefits:

DB is never exposed to the internet.

Backend is only reachable by Traefik and DB.

Clear separation of concerns.

7. Validation Steps
✓ Check Traefik can reach backend
docker exec -it traefik wget -qO- http://backend:3000/health


Output should be:

OK

✓ Check public access
curl -I http://<public-ip>


Response should be:

HTTP/1.1 200 OK

✓ View routing in browser

Go to:

http://<public-ip>/


EpicBook should load.

8. Summary

The Traefik configuration provides:

🔒 Security — Only port 80 exposed; backend + DB private

📦 Clean routing — All paths served by backend cleanly

🌐 CORS protection — Only your allowed origin can access API

🔁 Self-healing traffic — Traefik routes only to healthy services

🧩 Modular config — Dynamic middlewares, future TLS support
