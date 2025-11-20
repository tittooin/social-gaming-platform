# API Usage

Base URL: `http://localhost:4000`

## Auth

### POST `/auth/otp`
- Body:
```
{
  "phone": "+919876543210",
  "deviceId": "device-abc-123"
}
```
- Response:
```
{ "success": true }
```

### POST `/auth/verify`
- Body:
```
{
  "phone": "+919876543210",
  "token": "123456",
  "deviceId": "device-abc-123"
}
```
- Response:
```
{
  "user": { "id": "<uuid>", "phone": "+919876543210" },
  "access_token": "<supabase_access_token>",
  "refresh_token": "<supabase_refresh_token>",
  "token_type": "bearer",
  "expires_in": 3600
}
```
- Use `access_token` as Bearer token for subsequent calls.

## Wallet

### GET `/wallet`
- Headers:
  - `Authorization: Bearer <access_token>`
- Response:
```
{
  "wallet": {
    "id": "<uuid>",
    "user_id": "<uuid>",
    "earned_chips": 0,
    "purchased_chips": 0,
    "diamonds": 0,
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

## Match

### POST `/match/start`
- Headers: Authorization Bearer
- Body: `{}`
- Response:
```
{ "matchId": "<uuid>", "serverSeed": "<hex>" }
```

### POST `/match/end`
- Headers: Authorization Bearer
- Body:
```
{ "matchId": "<uuid>", "clientRoll": 4 }
```
- Response:
```
{
  "serverRoll": 2,
  "reward": 90,
  "wallet": { "earned_chips": 90, "purchased_chips": 0, "diamonds": 0 }
}
```

## Security Notes (Phase-1)
- OTP is handled via Supabase; backend stores logs.
- Authorization is via Supabase JWT verification.
- Match end performs server-side validation and deterministic server roll based on server seed.
- Chips awarded are tracked with atomic transactions; conversions update diamonds.