-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  phone text UNIQUE,
  device_id text,
  followers_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);