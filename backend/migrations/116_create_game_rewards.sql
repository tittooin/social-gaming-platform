-- Game rewards tracking: wins/losses and chip adjustments
CREATE TABLE IF NOT EXISTS game_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL,
  user_id UUID NOT NULL,
  game_type TEXT NOT NULL CHECK (game_type IN ('ludo','chess','word')),
  outcome TEXT NOT NULL CHECK (outcome IN ('win','loss','draw')),
  fee_chips INTEGER NOT NULL DEFAULT 10,
  win_chips INTEGER NOT NULL DEFAULT 100,
  net_chips INTEGER NOT NULL DEFAULT 90,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE game_rewards
  ADD CONSTRAINT fk_rewards_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE;

ALTER TABLE game_rewards
  ADD CONSTRAINT fk_rewards_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_rewards_user ON game_rewards (user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_match ON game_rewards (match_id);
CREATE INDEX IF NOT EXISTS idx_rewards_game ON game_rewards (game_type);