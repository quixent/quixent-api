# Ansora API

Backend for **Ansora** — a private couples compatibility app. Two people connect using a secure 6-digit code, independently answer personality/lifestyle questions, and receive a detailed compatibility score.

Built with **Express + TypeScript + MongoDB**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT (Bearer token) |
| OTP | Console log (dev) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ansora
JWT_SECRET=your_jwt_secret_here
```

### Run

```bash
# Development (hot reload)
npm run dev

# Production
npm run build
npm start
```

Server starts at `http://localhost:5000`

---

## API Reference

### System

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Lightweight status check — uptime, DB state |
| GET | `/test` | Full connectivity check — DB ping, returns 503 on failure |

---

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/send-otp` | No | Send OTP to mobile number |
| POST | `/api/auth/verify-otp` | No | Verify OTP, returns JWT token |
| GET | `/api/auth/me` | Yes | Get current user profile |
| POST | `/api/auth/profile` | Yes | Create / update user profile |

**POST `/api/auth/send-otp`**
```json
{ "mobile": "9876543210" }
```

**POST `/api/auth/verify-otp`**
```json
{ "mobile": "9876543210", "otp": "123456" }
```
Response:
```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { ... },
    "profileComplete": false
  }
}
```

**POST `/api/auth/profile`**
```json
{ "name": "Raj", "gender": "male", "age": 25, "city": "Chennai", "bio": "..." }
```

---

### Match — `/api/match`

All endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/match/generate-code` | Generate a 6-digit connect code (10 min TTL) |
| POST | `/api/match/connect-by-code` | Enter partner's code to connect |
| GET | `/api/match/matches` | List active matches with progress |
| GET | `/api/match/questions?matchId=` | Get all questions with your answered state |
| POST | `/api/match/answer` | Submit an answer to a question |
| GET | `/api/match/score?matchId=` | Get compatibility score (both must finish) |
| GET | `/api/match/messages?matchId=` | Fetch chat messages |
| POST | `/api/match/message` | Send a chat message |

**POST `/api/match/connect-by-code`**
```json
{ "code": "482910" }
```

**POST `/api/match/answer`**
```json
{ "matchId": "<id>", "questionId": "<id>", "optionId": "<id>" }
```

**GET `/api/match/score`** — available only after both partners answer all questions.

---

## Score Calculation

Each question is scored out of **10 points** based on how close the two answers are:

| Situation | Points |
|---|---|
| Same answer | 10 |
| Weight gap ≤ 1 | 6 |
| Weight gap ≤ 2 | 4 |
| Weight gap > 2 | 2 |

```
compatibility % = round( totalEarned / (questions × 10) × 100 )
```

---

## OTP Rate Limiting

- **Cooldown**: 60 seconds between requests
- **Daily limit**: 10 OTPs per mobile number per day
- **Max attempts**: 5 wrong attempts before OTP is invalidated
- **Expiry**: 5 minutes

---

## Data Models

| Model | Purpose |
|---|---|
| `User` | Profile — name, gender, age, city, bio, mobile |
| `Otp` | Active OTP with attempt counter |
| `OtpRateLimit` | Rate limit tracking per mobile (24h TTL) |
| `ConnectCode` | 6-digit pairing code (10 min TTL) |
| `Match` | Connection between two users (accepted / complete) |
| `Question` | Compatibility question with weighted options |
| `Answer` | User's answer to a question within a match |
| `Message` | Chat message within a match |
