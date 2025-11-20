# Security & Anti-Cheat Notes (Phase-1)

## Token Verification
- All protected endpoints require `Authorization: Bearer <access_token>` from Supabase OTP verify.
- Middleware verifies JWT signature with `JWT_SECRET` and checks audience `authenticated`.

## Match Integrity
- Server generates `server_seed` at start and stores it.
- End uses deterministic `server_roll = sha256(server_seed:matchId)` to prevent client tampering.
- Server validates the match belongs to the requesting user and is not already ended.

## Wallet Atomicity
- `endMatch` runs inside a DB transaction and locks the wallet row using `FOR UPDATE`.
- Chips updates are atomic and diamonds are recalculated from total chips.

## Anti-Cheat Suggestions (Future Phases)
- Add replay submission and validation.
- Rate-limit OTP requests; lock account on excessive failures.
- Use device fingerprinting and anomaly detection on roll distributions.
- Enable RLS policies for direct table access if exposing queries to clients.
- Store server seeds encrypted and expose hashed proof for fairness.