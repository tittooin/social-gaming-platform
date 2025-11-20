-- Leaderboards for daily and weekly scores per game
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type TEXT NOT NULL CHECK (game_type IN ('ludo','chess','word')),
  user_id UUID NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('daily','weekly')),
  period_start DATE NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (game_type, user_id, period, period_start)
);

ALTER TABLE leaderboards
  ADD CONSTRAINT fk_leaderboards_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_lb_game_period ON leaderboards (game_type, period, period_start);
CREATE INDEX IF NOT EXISTS idx_lb_user ON leaderboards (user_id);