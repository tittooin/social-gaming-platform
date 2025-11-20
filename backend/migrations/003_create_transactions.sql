-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_id uuid REFERENCES wallets(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('earned','purchase','spend')),
  amount_chips bigint NOT NULL DEFAULT 0,
  amount_diamonds bigint NOT NULL DEFAULT 0,
  source text,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);