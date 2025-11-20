# Supabase Setup

Follow these exact steps to configure Supabase for the backend.

## 1) Create Project
- Go to https://app.supabase.com and create a new project.
- Choose a strong database password and region close to your users.
- After project is ready, note your project URL (e.g., `https://xyzcompany.supabase.co`).

## 2) Enable Auth (Phone OTP)
- In Dashboard → Authentication → Settings:
  - Enable Phone auth.
  - Disable email signup if you only want phone in Phase-1.
- In Authentication → SMS Settings:
  - Configure SMS provider (Twilio or Supabase-built provider available by region).

## 3) JWT Secret
- Dashboard → Settings → API:
  - Copy `JWT Secret` value. Put it in `backend/.env` as `JWT_SECRET`.

## 4) Policies & Tables
- The backend uses its own tables in the Supabase Postgres DB and does NOT rely on RLS for Phase-1 as the service role performs writes.
- Create the following tables by running backend migrations:
  - `users`, `wallets`, `transactions`, `matches`, `auth_otplogs`.
- Run: `cd backend && npm ci && npm run migrate`.

## 5) Generate Service Keys
- Dashboard → Settings → API:
  - Copy `Project URL` → `SUPABASE_URL`.
  - Copy `Service role key` → `SUPABASE_SERVICE_KEY`.
  - Copy `anon key` → `SUPABASE_ANON_KEY`.
- Put these in `backend/.env` accordingly.

## 6) Enable Realtime
- Dashboard → Database → Replication → Realtime:
  - Enable Realtime for `public` schema.
  - Add tables `matches`, `wallets` if you plan to push live updates to clients.

## 7) Storage Buckets
- Dashboard → Storage:
  - Create bucket `avatars` (public read) for user avatars.
  - Create bucket `replays` (private) for match replays (future-phase).

## 8) Backend Env Config
- Copy `backend/.env.example` to `backend/.env` and fill values:
```
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/social_gaming
DB_SSL=false
DB_POOL_MAX=10
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_KEY=service_role_key_here
SUPABASE_ANON_KEY=anon_key_here
JWT_SECRET=<from Supabase API settings>
```

## 9) Run Locally
- `cd backend && npm ci && npm run migrate && npm run dev`
- Test with Postman collection in `docs/Postman_Collection.json`.