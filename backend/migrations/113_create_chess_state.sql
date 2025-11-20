-- Chess per-match server-side state snapshotting
CREATE TABLE IF NOT EXISTS chess_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL,
  user_id UUID NOT NULL,
  game_type TEXT NOT NULL DEFAULT 'chess',
  seed TEXT,
  state_json JSONB NOT NULL,
  result TEXT,
  score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chess_state
  ADD CONSTRAINT fk_chess_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE;

ALTER TABLE chess_state
  ADD CONSTRAINT fk_chess_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_chess_match ON chess_state (match_id);
CREATE INDEX IF NOT EXISTS idx_chess_user ON chess_state (user_id);