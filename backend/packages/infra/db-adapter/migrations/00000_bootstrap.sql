-- Bootstrap migration
-- Enables uuid-ossp for DB-level UUID generation fallback.
-- NOTE: The application always supplies UUIDs explicitly (randomUUID() from Node.js
-- crypto, which produces UUIDv4). The DB default is a safety net only.
-- UUIDv7 ordering is handled at the application layer.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE admin_role AS ENUM ('admin', 'super_admin');

CREATE TABLE IF NOT EXISTS admins (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  role          admin_role  NOT NULL DEFAULT 'admin',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS products (
  id               UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT          NOT NULL,
  description      TEXT          NOT NULL,
  price            NUMERIC(12,2) NOT NULL,
  stock            NUMERIC(10,0) NOT NULL,
  whatsapp_number  TEXT          NOT NULL,
  image_url        TEXT,
  is_active        BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id    UUID        NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  token_hash  TEXT        NOT NULL UNIQUE,
  family_id   UUID        NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id   UUID        NOT NULL REFERENCES admins(id) ON DELETE RESTRICT,
  action     TEXT        NOT NULL,
  entity     TEXT        NOT NULL,
  entity_id  TEXT        NOT NULL,
  payload    JSONB       NOT NULL,
  ip         TEXT        NOT NULL,
  ua         TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
