# Quixent Auth API

Centralized authentication service for all Quixent projects. Handles phone number + OTP login — no passwords.

## Tech Stack

- TypeScript + Express.js
- MongoDB + Mongoose (`quixent-auth` database)
- JWT access tokens (15 min) + refresh tokens (7 days, HttpOnly cookie)
- 2Factor.in for SMS OTP delivery

## Setup

```bash
npm install
cp .env.example .env   # fill in your values
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRY` | Access token expiry (e.g. `15m`) |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry (e.g. `7d`) |
| `CLIENT_ORIGINS` | Comma-separated allowed CORS origins |
| `MATCH_API_URL` | URL of the match calculator service |
| `TWOFACTOR_API_KEY` | 2Factor.in API key |
| `TWOFACTOR_SENDER_ID` | SMS sender ID |
| `TWOFACTOR_OTP_TEMPLATE` | OTP SMS template name |
| `TWOFACTOR_THANKS_TEMPLATE` | Thank-you SMS template name |
| `NODE_ENV` | `development` or `production` |

## API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/send-otp` | No | Send OTP to mobile number |
| POST | `/api/auth/verify-otp` | No | Verify OTP and get tokens |
| POST | `/api/auth/refresh` | Cookie | Refresh access token |
| POST | `/api/auth/logout` | Bearer | Logout and clear refresh token |
| GET | `/api/auth/me` | Bearer | Get current user profile |
| GET | `/api/auth/user/:id` | Bearer | Get basic profile of any user by ID |
| PUT | `/api/auth/update-profile` | Bearer | Update user profile |
| POST | `/api/auth/profile` | Bearer | Update user profile (alias) |
| DELETE | `/api/auth/delete-account` | Bearer | Deactivate account |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |

## Request / Response Examples

### Send OTP
```json
POST /api/auth/send-otp
{ "mobile": "9876543210" }
```

### Verify OTP
```json
POST /api/auth/verify-otp
{ "mobile": "9876543210", "code": "123456" }

Response:
{
  "success": true,
  "data": {
    "token": "<access_token>",
    "accessToken": "<access_token>",
    "profileComplete": false,
    "isNewUser": true,
    "user": { "_id": "...", "mobile": "...", "name": null }
  }
}
```

## Rate Limiting

- OTP endpoints: 20 requests / 15 min per IP (development), 3 / 15 min (production)
- Per mobile: 60-second cooldown between requests, max 10 per day

## Scripts

```bash
npm run dev      # Start with ts-node-dev (hot reload)
npm run build    # Compile TypeScript
npm start        # Run compiled build
```
