# ADR 0003: Admin IP allowlist behind api-gateway

## Status

Accepted

## Context

The admin-service enforces `ADMIN_ALLOWED_IPS` using Express `req.ip`. Requests reach admin-service through the api-gateway. Without `trust proxy`, `req.ip` reflects the **TCP peer** (the gateway container on the Docker bridge), not the client that connected to the gateway, so allowlist entries such as `127.0.0.1` never match and the API returns **403** (`IP_NOT_ALLOWED`).

Clients can also send a spoofed `X-Forwarded-For` header; forwarding that value blindly to admin-service would weaken the allowlist.

## Decision

1. **api-gateway** — For `/api/v1/admin/*` only, the proxy sets **`X-Forwarded-For` to the normalized TCP peer address** of the connection **to the gateway** (replacing any client-supplied value for that hop). Spoofing the browser header does not change the socket peer.

2. **admin-service** — Sets **`trust proxy`** using `ADMIN_TRUST_PROXY_HOPS` (default **1**) so `req.ip` is derived from that header for allowlist checks.

## Consequences

- Local dev (Vite → gateway) and Docker deployments behave consistently: the allowlisted IP is whoever connects to the gateway, not the internal gateway→admin hop.
- If the gateway is placed behind **another** reverse proxy, the peer seen by the gateway may be that proxy. Operators must then extend `ADMIN_ALLOWED_IPS`, configure the edge to set a trusted client IP header, or increase hops only in a controlled network.
- `ADMIN_ALLOWED_IPS` may include **IPv4 CIDR** entries (e.g. `172.16.0.0/12`) so containers on the default Docker bridge (often `172.x.x.x`) are allowed without listing every address.
- If `ADMIN_ALLOWED_IPS` is set to loopbacks only (a common `.env`), **admin-service** appends `172.16.0.0/12` automatically unless `ADMIN_ALLOW_DOCKER_BRIDGE=0`, so Docker peers are not blocked by mistake.
