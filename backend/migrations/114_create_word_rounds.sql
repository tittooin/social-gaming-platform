-- Word Sprint per-round records
CREATE TABLE IF NOT EXISTS word_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL,
  user_id UUID NOT NULL,
  game_type TEXT NOT NULL DEFAULT 'word',
  seed TEXT,
  state_json JSONB NOT NULL,
  result TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE word_rounds
  ADD CONSTRAINT fk_word_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE;

ALTER TABLE word_rounds
  ADD CONSTRAINT fk_word_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_word_match ON word_rounds (match_id);
CREATE INDEX IF NOT EXISTS idx_word_user ON word_rounds (user_id);