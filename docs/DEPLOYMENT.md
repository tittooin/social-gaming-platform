# Deployment Guide

This project includes:
- Backend (`backend/`) — Node.js Express API + static HTML5 games served at `/games/<id>/`.
- React Native app (`SocialGamingRN/`) — mobile client.
- Web app (`social-gaming-app/`) — Expo web client.
- CI/CD (`.github/workflows/ci.yml`) — builds Docker image and can deploy to a server via SSH.

## Option A: Deploy Backend via GitHub Actions to a VPS (Fastest if you have a server)

Prerequisites on your VPS (Ubuntu recommended):
- Install Docker and allow it to run without sudo.
  ```bash
  sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io
  sudo usermod -aG docker $USER && newgrp docker
  ```
- Open ports or set up Nginx to proxy your domain to port `4000`.

GitHub Secrets (Repository → Settings → Secrets and variables → Actions):
- `STAGING_HOST`: your VPS IP or hostname
- `STAGING_USER`: SSH username
- `STAGING_SSH_KEY`: private key (PEM format) for SSH
- `STAGING_DATABASE_URL`: Postgres connection string
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_ANON_KEY`: if using Supabase
- `JWT_SECRET`: Supabase JWT secret or your own

Workflow behavior:
- CI builds Docker image and pushes to GHCR.
- Deploy job SSHes to your server, pulls the image, runs container on `:4000`, and executes `node scripts/runMigrations.js` inside the container to apply DB schema.

Nginx example (optional) to expose on `https://api.yourdomain.com`:
```nginx
server {
  listen 80;
  server_name api.yourdomain.com;
  location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

## Option B: Render.com (Managed, simple)

1) Create a new Web Service → Connect this GitHub repo → Choose Docker.
2) Set environment variables:
   - `PORT=4000`
   - `DATABASE_URL`, `DB_SSL=true`
   - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_ANON_KEY` (if used)
   - `JWT_SECRET`
3) Start command (if Render allows overriding CMD): `node scripts/runMigrations.js && node app.js`.
   - If not, run migrations once via a one-off job or SSH into the container: `node scripts/runMigrations.js`.
4) After deploy, your backend will be at `https://<render-service>.onrender.com`.

## Option C: Railway (Managed, simple)

1) Create a new Railway project → Add this repo.
2) Set variables (`PORT`, `DATABASE_URL`, `DB_SSL`, Supabase keys, `JWT_SECRET`).
3) Pre-deploy command: `node scripts/runMigrations.js`.
4) Start command: `node app.js`.

## Database

You can use:
- Supabase Postgres (copy your connection string to `STAGING_DATABASE_URL` and set `DB_SSL=true`).
- Render/Railway Postgres.

Run migrations:
- In CI deploy we already call `docker exec social-gaming-backend node scripts/runMigrations.js`.
- Manually: `node backend/scripts/runMigrations.js` with appropriate env vars.

## Static HTML5 Games

- Served under `/games/<id>/`. Example: `/games/ludo/`.
- RN Game Player loads external host first (now configurable), then falls back to backend `/games/<id>`.

## Mobile (React Native)

Configure production base URL in `SocialGamingRN/.env`:
```
BASE_URL=https://api.yourdomain.com
EXTERNAL_HOST_GAMES=https://games.yourdomain.com
```
Builds:
- Android: `cd SocialGamingRN/android && ./gradlew assembleRelease` (set signing configs).
- iOS: open Xcode, archive for release, or use Fastlane.

## Web (social-gaming-app)

- Deploy via Vercel/Netlify.
- Ensure it points to your backend `BASE_URL` (configure env or a constants file).

## DNS and SSL

- Point your domain to the hosting provider.
- Use Let’s Encrypt (Nginx) or provider-managed HTTPS.

## Troubleshooting

- CORS: backend currently uses `cors({ origin: '*' })` — should work for web and RN.
- 403 on push: ensure PAT includes `repo` + `workflow` when pushing `.github/workflows/*`.
- Migrations: if tables are missing, rerun `scripts/runMigrations.js`.