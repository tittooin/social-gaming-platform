# Developer Guide

## Folder-by-Folder
- `backend/`: Express app with routes `auth`, `wallet`, `match`; services for Supabase, wallet, match; DB pool and migrations; Dockerfile; `.env.example`.
- `unity-game/`: Minimal scripts for Dice Battle prototype (`APIClient.cs`, `MatchManager.cs`, `DiceController.cs`).
- `docs/`: Setup guide (Supabase), API usage, Postman collection, security and testing notes.
- `scripts/`: Deployment helper and readme.
- `.github/workflows/`: CI/CD pipeline for backend.

## Running Backend Locally
- Requirements: Node 18+, PostgreSQL (or Supabase project), environment variables set.
- Setup:
  - `cd backend`
  - `cp .env.example .env` and fill values
  - `npm ci`
  - `npm run migrate`
  - `npm run dev`
- Health: `GET /health`

## Running Unity Project
- Open `unity-game` in Unity Hub (2021.3+ recommended).
- Create a scene `Main` and add a Canvas with `StatusText`, `ResultText`, `WalletText` Text elements and `StartButton`, `RollButton`, `EndButton`.
- Add an empty GameObject, attach `MatchManager`. Link UI references in Inspector.
- Add another Text for dice value and attach `DiceController` with that reference.
- Add `APIClient` to a GameObject; set `baseUrl = http://localhost:4000` and paste `bearerToken` from `/auth/verify` response.
- Play the scene:
  - Press Start → Roll → End; watch wallet text update.

## Testing Notes
- Unit tests are deferred to Phase-2; this skeleton includes deterministic server-side computation for match results and atomic wallet updates.
- Use Postman collection (`docs/Postman_Collection.json`) to validate endpoints.
- Consider adding integration tests for transactions and match flows once CI pipeline includes a database service.

## Environment Variables
- See `backend/.env.example` for all required vars.
- In CI, store sensitive values as repository secrets.

## API Keys & Secrets
- Supabase `JWT_SECRET` must match Dashboard → Settings → API → JWT Secret.
- Use Service Role key for backend operations like OTP verification.