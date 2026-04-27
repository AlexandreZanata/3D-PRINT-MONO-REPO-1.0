-- Bootstrap migration: enable UUIDv7 extension
-- This must run before any table creation that uses uuid_generate_v7()

-- Install pg_uuidv7 extension (requires superuser or rds_superuser role)
-- If using a managed PostgreSQL service, ensure the extension is available
CREATE EXTENSION IF NOT EXISTS "pg_uuidv7";

-- Verify the function is available
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'uuid_generate_v7'
  ) THEN
    RAISE EXCEPTION 'uuid_generate_v7() function not found — pg_uuidv7 extension failed to load';
  END IF;
END $$;
