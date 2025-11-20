-- Followers table
CREATE TABLE IF NOT EXISTS followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, followee_id)
);

CREATE INDEX IF NOT EXISTS idx_followers_followee ON followers(followee_id);
CREATE INDEX IF NOT EXISTS idx_followers_follower ON followers(follower_id);