-- OTP logs
CREATE TABLE IF NOT EXISTS auth_otplogs (
  id bigserial PRIMARY KEY,
  phone text NOT NULL,
  device_id text,
  status text NOT NULL,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_otplogs_phone ON auth_otplogs(phone);