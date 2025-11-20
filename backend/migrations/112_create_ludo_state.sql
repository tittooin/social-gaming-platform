-- Ludo per-match server-side state snapshotting
CREATE TABLE IF NOT EXISTS ludo_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL,
  user_id UUID NOT NULL,
  game_type TEXT NOT NULL DEFAULT 'ludo',
  seed TEXT,
  state_json JSONB NOT NULL,
  result TEXT,
  score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ludo_state
  ADD CONSTRAINT fk_ludo_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE;

ALTER TABLE ludo_state
  ADD CONSTRAINT fk_ludo_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_ludo_match ON ludo_state (match_id);
CREATE INDEX IF NOT EXISTS idx_ludo_user ON ludo_state (user_id);