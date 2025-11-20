-- Add Phase-2 fields to users (username, banned)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username text UNIQUE,
  ADD COLUMN IF NOT EXISTS banned boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);