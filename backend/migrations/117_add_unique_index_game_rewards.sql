-- Ensure upsert target exists for game_rewards
CREATE UNIQUE INDEX IF NOT EXISTS uniq_rewards_mux
  ON game_rewards (match_id, user_id, game_type);