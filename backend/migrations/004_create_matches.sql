-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  server_seed text NOT NULL,
  client_roll integer,
  server_roll integer,
  status text NOT NULL CHECK (status IN ('started','ended','cancelled')),
  reward_chips bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_matches_user ON matches(user_id);