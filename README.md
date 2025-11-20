# Social Gaming Platform Monorepo

Cross-platform gaming + social platform (Android, iOS, Windows) using:
- Frontend/Game: Unity
- Backend: Node.js (Express)
- Database: PostgreSQL (Supabase)
- Auth: Supabase Auth
- Realtime: Supabase Realtime
- Payments/KYC: Cashfree (stubbed for Phase-1)

## Repository Structure

```
/
├─ backend/            # Node.js + Express backend
├─ unity-game/         # Unity project starter + Dice Battle prototype scripts
├─ docs/               # Developer documentation, API usage, Supabase setup, Postman collection
├─ scripts/            # Operational scripts (e.g., deploy, utilities)
├─ .github/workflows/  # CI/CD pipeline (GitHub Actions)
└─ README.md           # Monorepo overview
```

### What goes inside each folder
- `backend/`: Express app, routes, controllers, middleware, services, DB pool, migrations, Dockerfile, env template, migration runner.
- `unity-game/`: Minimal Unity project structure with C# scripts for API communication and Dice Battle prototype flow.
- `docs/`: Setup guide, API docs, testing notes, Supabase configuration, Postman collection JSON.
- `scripts/`: Deployment and helper scripts; staging deploy example.
- `.github/workflows/`: CI/CD pipeline for install, lint, test, build (Docker), and deploy.

## Quickstart

- Prerequisites: Node 18+, npm, PostgreSQL (Supabase project), Unity 2021.3+.
- Configure Supabase (see `docs/SETUP.md`).
- Copy `backend/.env.example` to `backend/.env` and fill values.
- Install backend dependencies: `cd backend && npm ci`
- Run DB migrations: `npm run migrate`
- Start backend: `npm run dev`
- Import `unity-game` into Unity Hub; open the project and attach scripts to a simple scene per `docs/SETUP.md`.

## Phase-1 Endpoints

- `POST /auth/otp`
- `POST /auth/verify`
- `GET /wallet`
- `POST /match/start`
- `POST /match/end`

See detailed request/response samples in `docs/API.md` and Postman collection in `docs/Postman_Collection.json`.