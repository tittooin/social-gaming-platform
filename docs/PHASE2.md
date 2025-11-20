# Phase-2: Social System + Chat (Local PostgreSQL)

This document explains how to run, migrate, and test the Phase-2 social and chat features locally, and how Unity connects via REST and WebSocket.

## Run Backend with PostgreSQL

- Ensure PostgreSQL is installed locally and running on `localhost:5432`.
- Create database: `CREATE DATABASE social_gaming;`
- Set `backend/.env`:
  - `DATABASE_URL=postgresql://postgres:<YOUR_PASSWORD>@localhost:5432/social_gaming`
  - `DB_SSL=false`
  - `JWT_SECRET=local_dev_secret`
  - Optionally set `ADMIN_KEY=local_admin_key` for moderation endpoints.

Install deps and run:

```
cd backend
npm install
npm run migrate
npm run dev
```

Health: `GET http://localhost:4000/health`

## API Endpoints

Authentication (Local dev):
- `POST /auth/login` → `{ "username": "player1" }` returns `{ token, user }`

Profile:
- `POST /profile/update` → `{ display_name, bio, avatar_url }`
- `GET /profile/:id`

Followers:
- `POST /follow` → `{ userId }`
- `POST /unfollow` → `{ userId }`
- `GET /followers/:id`
- `GET /following/:id`

Posts:
- `POST /post` → `{ content, image_url, video_url }`
- `GET /feed`
- `GET /post/:id`
- `POST /post/:id/like` → `{}`
- `POST /post/:id/comment` → `{ content }`
- `DELETE /post/:id`

Upload:
- `POST /upload` (form-data: `file`) → returns `{ url, filename }`
- Static files served at `http://localhost:4000/uploads/<filename>`

Admin Moderation:
- `POST /report/post` → `{ postId, reason }`
- `POST /report/user` → `{ userId, reason }`
- `POST /moderate/hidePost` → `{ postId }` (requires header `x-admin-key: local_admin_key`)
- `POST /moderate/banUser` → `{ userId }` (requires header `x-admin-key: local_admin_key`)

Headers:
- Set `Authorization: Bearer <token>` for protected routes.
- Set `Content-Type: application/json` for JSON bodies.

## WebSocket Chat

Lobby:
- Connect: `ws://localhost:4000/ws/lobby?token=<JWT>`
- Send text messages; server persists to `chat_messages` and broadcasts to all lobby clients.

Direct Messages:
- Connect: `ws://localhost:4000/ws/dm?token=<JWT>&peer=<USER_ID>`
- Room key is deterministic: `min(userId, peer)_max(userId, peer)`.
- Messages are persisted per room and broadcast to connected peers.

## Sample JSON Requests

Login:
```
POST /auth/login
{ "username": "player1" }
```

Update Profile:
```
POST /profile/update
{ "display_name": "Player One", "bio": "GG", "avatar_url": null }
```

Create Post:
```
POST /post
{ "content": "Hello world!", "image_url": null, "video_url": null }
```

Comment:
```
POST /post/<POST_ID>/comment
{ "content": "Nice!" }
```

Report Post:
```
POST /report/post
{ "postId": "<POST_ID>", "reason": "spam" }
```

Moderate Hide Post:
```
POST /moderate/hidePost
Headers: x-admin-key: local_admin_key
{ "postId": "<POST_ID>" }
```

## Unity Integration

Scripts added under `unity-game/Assets/Scripts/`:
- `SocialAPI.cs`: REST client using `UnityWebRequest` for login, profile, posts, feed, like, comment.
- `ProfileManager.cs`: UI glue for login and profile update.
- `PostManager.cs`: UI glue for create post and load feed.
- `ChatManager.cs`: WebSocket client using `WebSocketSharp` for lobby and DM chat.

WebSocketSharp:
- Import `WebSocketSharp` DLL into your Unity project (e.g., via `Plugins/` folder) to enable `using WebSocketSharp;`.

Usage:
- Set `BaseUrl = http://localhost:4000` in `SocialAPI`.
- Call `Login()` to get token, then use `ConnectLobbyChat()` / `ConnectDMChat()` in `ChatManager`.

## Testing via Postman

1) Login to get token.
2) Add `Authorization` header with `Bearer <token>`.
3) Hit profile, followers, posts, upload endpoints as listed above.
4) For admin endpoints, add `x-admin-key: local_admin_key`.

## Notes

- All features are wired for local development only (no cloud).
- Uploads are stored under `backend/uploads` and served via `/uploads`.
- Ensure `JWT_SECRET` is set in `.env`.