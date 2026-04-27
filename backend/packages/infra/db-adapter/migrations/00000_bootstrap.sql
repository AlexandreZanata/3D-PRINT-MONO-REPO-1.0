-- Bootstrap migration: PostgreSQL 18.1+ native UUIDv7 support
-- PostgreSQL 18.1 introduced gen_random_uuid_v7() as a built-in function
-- No extension required

-- Verify PostgreSQL version supports native UUIDv7
DO $$
BEGIN
  IF current_setting('server_version_num')::int < 180100 THEN
    RAISE EXCEPTION 'PostgreSQL 18.1 or higher required for native UUIDv7 support. Current version: %', 
      current_setting('server_version');
  END IF;
END $$;

-- Verify the function is available
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'gen_random_uuid_v7'
  ) THEN
    RAISE EXCEPTION 'gen_random_uuid_v7() function not found — PostgreSQL 18.1+ required';
  END IF;
END $$;
