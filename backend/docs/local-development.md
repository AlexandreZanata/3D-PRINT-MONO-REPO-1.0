# Local Development Guide

This guide explains how to run the full backend stack locally using Docker,
apply database migrations, seed initial data, and access the admin panel.

---

## Why `DB_ERROR: findAll failed` happens

The services connect to PostgreSQL on startup. If the tables do not exist yet,
every query fails with:

```json
{ "success": false, "error": { "code": "DB_ERROR", "message": "findAll failed" } }
```

**Root cause:** Docker Compose starts the application services as soon as
PostgreSQL is *healthy* (accepting connections), but that only means the
server process is running — it does not mean the schema exists. The migrations
must be applied manually on the first run, or automatically via the `migrate`
service added to `docker-compose.yml`.

---

## First-time setup (run once)

### 1. Generate JWT keys

The `admin-service` uses RS256 asymmetric signing. The key pair must exist
before the container starts.

```bash
mkdir -p backend/secrets
openssl genrsa -out backend/secrets/jwt.private.pem 2048
openssl rsa -in backend/secrets/jwt.private.pem -pubout \
  -out backend/secrets/jwt.public.pem
```

### 2. Copy the env file

```bash
cp backend/.env backend/infra/.env
```

### 3. Build and start all services

```bash
cd backend
docker compose -f infra/docker-compose.yml --env-file .env up -d --build
```

The `migrate` service runs automatically before `product-service` and
`admin-service` start. It applies all SQL files in
`packages/infra/db-adapter/migrations/` in order.

### 4. Seed initial data (first time only)

The seed creates the default admin user and sample products.

```bash
cd backend
POSTGRES_HOST=localhost \
POSTGRES_PORT=5432 \
POSTGRES_DB=ecommerce \
POSTGRES_USER=postgres \
POSTGRES_PASSWORD=localdev123 \
npx tsx packages/infra/db-adapter/src/seed.ts
```

> The seed uses `INSERT` — running it again on an existing database is safe.
> Rows with duplicate IDs are silently skipped.

---

## Subsequent starts

After the first setup, just run:

```bash
docker compose -f infra/docker-compose.yml --env-file .env up -d
```

The `migrate` service re-runs on every `up` but all migrations use
`IF NOT EXISTS` / `IF NOT EXISTS` guards, so they are idempotent.

---

## Adding a new migration

1. Create a new file in `packages/infra/db-adapter/migrations/` following the
   naming convention: `000XX_description.sql`
2. Write idempotent SQL (use `IF NOT EXISTS`, `ON CONFLICT DO NOTHING`, etc.)
3. The `migrate` service command in `docker-compose.yml` must be updated to
   include the new file:

```yaml
command: >
  sh -c "
    psql ... -f /migrations/00000_bootstrap.sql &&
    psql ... -f /migrations/00001_product_rich_fields_and_site_settings.sql &&
    psql ... -f /migrations/00002_your_new_migration.sql &&
    echo 'migrations complete'
  "
```

---

## Service ports

| Service | Port | Notes |
|---|---|---|
| **api-gateway** | 3000 | Single entry point for the frontend |
| product-service | 3001 | Internal — do not call directly |
| admin-service | 3002 | Internal — do not call directly |
| notification-service | 3003 | Internal — do not call directly |
| PostgreSQL | 5432 | Accessible from host for seed/migrations |
| Redis | 6379 | Internal |
| RabbitMQ | 5672 | Internal |
| RabbitMQ UI | 15672 | `http://localhost:15672` — guest / localdev123 |
| Adminer (DB UI) | 8080 | `http://localhost:8080` |

---

## Useful commands

```bash
# Check all container statuses
docker compose -f infra/docker-compose.yml --env-file .env ps

# Follow logs for a specific service
docker compose -f infra/docker-compose.yml --env-file .env logs -f product-service

# Stop everything (data is preserved in volumes)
docker compose -f infra/docker-compose.yml --env-file .env down

# Stop and wipe all data (fresh start)
docker compose -f infra/docker-compose.yml --env-file .env down -v

# Rebuild a single service after a code change
docker compose -f infra/docker-compose.yml --env-file .env up -d --build product-service

# Run migrations manually against the running postgres container
docker compose -f infra/docker-compose.yml --env-file .env exec -T postgres \
  psql -U postgres -d ecommerce \
  < packages/infra/db-adapter/migrations/00000_bootstrap.sql

# Inspect the database tables
docker compose -f infra/docker-compose.yml --env-file .env exec postgres \
  psql -U postgres -d ecommerce -c "\dt"

# Verify the API is working
curl -s http://localhost:3000/api/v1/products | jq .
curl -s http://localhost:3000/health | jq .
```

---

## Accessing the admin panel

### Step 1 — Start the frontend dev server

```bash
cd frontend
npm run dev
```

The frontend starts on `http://localhost:8081` (or the next available port).
It proxies all `/api/*` requests to the api-gateway at `http://localhost:3000`.

### Step 2 — Open the login page

Navigate to:

```
http://localhost:8081/login
```

### Step 3 — Sign in

| Field | Value |
|---|---|
| Email | `admin@example.com` |
| Password | `Admin123!` |

These credentials are created by the seed script. If login fails, confirm the
admin exists:

```bash
docker compose -f infra/docker-compose.yml --env-file .env exec postgres \
  psql -U postgres -d ecommerce \
  -c "SELECT id, email, role FROM admins;"
```

### Step 4 — Admin panel sections

After login you are redirected to `/admin`. The navigation bar has three
sections:

| Section | URL | What you can do |
|---|---|---|
| **Products** | `/admin/products` | Create, edit, delete products. Manage images, category, material, dimensions, tagline, slug. |
| **Site settings** | `/admin/site-settings` | Edit hero headline, subheadline, hero image URL, CTA buttons, featured section title, story cards, footer copyright. |
| **Audit logs** | `/admin/audit-logs` | Read-only log of every admin action with timestamp, IP, and payload. |

### Step 5 — Changing site content

Go to **Site settings** (`/admin/site-settings`). Every field maps directly to
a key in the `site_settings` database table. Changes take effect immediately
on the public storefront — no rebuild or restart needed.

To set the hero image, paste a publicly accessible image URL into the
**Hero image URL** field and click **Save settings**.

---

## Troubleshooting

### `DB_ERROR: findAll failed`

The tables do not exist. Run the migrations:

```bash
docker compose -f infra/docker-compose.yml --env-file .env exec -T postgres \
  psql -U postgres -d ecommerce \
  < packages/infra/db-adapter/migrations/00000_bootstrap.sql

docker compose -f infra/docker-compose.yml --env-file .env exec -T postgres \
  psql -U postgres -d ecommerce \
  < packages/infra/db-adapter/migrations/00001_product_rich_fields_and_site_settings.sql
```

Then restart the services:

```bash
docker compose -f infra/docker-compose.yml --env-file .env restart \
  product-service admin-service
```

### Login returns 401

The admin user does not exist. Run the seed:

```bash
cd backend
POSTGRES_HOST=localhost POSTGRES_PORT=5432 POSTGRES_DB=ecommerce \
POSTGRES_USER=postgres POSTGRES_PASSWORD=localdev123 \
npx tsx packages/infra/db-adapter/src/seed.ts
```

### Login returns 403 / IP not allowed

The `ADMIN_ALLOWED_IPS` env var does not include your IP. For local dev it
should be:

```
ADMIN_ALLOWED_IPS=127.0.0.1,::1,::ffff:127.0.0.1
```

This is already set in `backend/.env`.

### `jwt.private.pem: no such file`

The JWT keys were not generated. Run step 1 of the first-time setup above.

### Products page is empty after login

The seed did not run or failed. Check:

```bash
docker compose -f infra/docker-compose.yml --env-file .env exec postgres \
  psql -U postgres -d ecommerce \
  -c "SELECT id, name, slug FROM products;"
```

If empty, run the seed script again.
