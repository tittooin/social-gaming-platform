-- Match moves table: stores sequential moves for all games
CREATE TABLE IF NOT EXISTS match_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL,
  user_id UUID NOT NULL,
  game_type TEXT NOT NULL CHECK (game_type IN ('ludo','chess','word')),
  move_json JSONB NOT NULL,
  move_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id, move_index)
);

ALTER TABLE match_moves
  ADD CONSTRAINT fk_moves_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE;

ALTER TABLE match_moves
  ADD CONSTRAINT fk_moves_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_moves_match ON match_moves (match_id);
CREATE INDEX IF NOT EXISTS idx_moves_user ON match_moves (user_id);
CREATE INDEX IF NOT EXISTS idx_moves_game_type ON match_moves (game_type);