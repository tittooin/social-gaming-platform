-- PHASE-4 Racing Module Tables
-- Using pgcrypto's gen_random_uuid()

-- Base races table
CREATE TABLE IF NOT EXISTS races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN ('bike','car')),
  track_id TEXT NOT NULL,
  seed TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started','finished','invalid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_races_user ON races(user_id);
CREATE INDEX IF NOT EXISTS idx_races_track ON races(track_id);

-- Race results table
CREATE TABLE IF NOT EXISTS race_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  finish_time_ms INTEGER NOT NULL,
  position INTEGER NOT NULL CHECK (position >= 1),
  checkpoints_hit INTEGER NOT NULL DEFAULT 0,
  nitro_used INTEGER NOT NULL DEFAULT 0,
  valid BOOLEAN NOT NULL DEFAULT true,
  validation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_race_results_user ON race_results(user_id);
CREATE INDEX IF NOT EXISTS idx_race_results_track ON race_results(track_id);
CREATE INDEX IF NOT EXISTS idx_race_results_race ON race_results(race_id);

-- Optional replay storage (JSON payload)
CREATE TABLE IF NOT EXISTS race_replays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  replay_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_race_replays_race ON race_replays(race_id);

-- AI interactions / logs
CREATE TABLE IF NOT EXISTS race_ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  log_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Racing leaderboards: best time per track (periodic)
CREATE TABLE IF NOT EXISTS leaderboards_racing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('daily','weekly','all_time')),
  best_time_ms INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_racing_lb ON leaderboards_racing (user_id, track_id, period);
CREATE INDEX IF NOT EXISTS idx_racing_lb_track_period ON leaderboards_racing (track_id, period);