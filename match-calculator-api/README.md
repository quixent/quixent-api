# Match Calculator API

Compatibility quiz and matching service. Users connect via a 6-digit code, answer questions, and get a compatibility score.

## Tech Stack

- TypeScript + Express.js
- MongoDB + Mongoose (`matchmaking` database)
- Token verification via Auth API (`/api/auth/me`)

## Setup

```bash
npm install
cp .env.example .env   # fill in your values
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5001) |
| `MONGO_URI` | MongoDB connection string |
| `AUTH_API_URL` | URL of the auth service (e.g. `http://localhost:5000`) |
| `CLIENT_ORIGINS` | Comma-separated allowed CORS origins |

## API Endpoints

All endpoints require `Authorization: Bearer <token>` header.

### Connect Code

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/match/generate-code` | Generate a 6-digit connect code |
| POST | `/match/connect-by-code` | Connect with a partner using their code |

### Matches

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/match/matches` | Get all my matches with partner info and progress |
| GET | `/match/:id` | Get a single match by ID |
| PUT | `/match/:id/accept` | Accept a match request |
| PUT | `/match/:id/reject` | Reject a match request |

### Questions & Answers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/match/questions?matchId=` | Get all questions with my existing answers |
| POST | `/match/answer` | Submit a single answer |
| POST | `/match/:id/answers` | Submit multiple answers at once |

### Score

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/match/score?matchId=` | Get compatibility score (available when both users complete quiz) |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/match/messages?matchId=` | Get all messages for a match |
| POST | `/match/message` | Send a message |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |

## Request / Response Examples

### Generate Code
```json
POST /match/generate-code

Response:
{ "success": true, "data": { "code": "482910", "expiresAt": "2026-05-19T..." } }
```

### Connect by Code
```json
POST /match/connect-by-code
{ "code": "482910" }
```

### Submit Answer
```json
POST /match/answer
{ "matchId": "...", "questionId": "...", "optionId": "..." }

Response:
{ "success": true, "data": { "answered": 3, "total": 10 } }
```

### Get Score
```json
GET /match/score?matchId=...

Response:
{
  "success": true,
  "data": {
    "compatibility": 75,
    "totalQuestions": 10,
    "answeredByYou": 10,
    "answeredByPartner": 10,
    "breakdown": [...]
  }
}
```

## Match Flow

```
User A generates code  →  shares code with User B
User B enters code     →  match created (auto-accepted)
Both answer questions  →  score calculated automatically
Score available        →  both can view compatibility result
```

## Scripts

```bash
npm run dev      # Start with ts-node-dev (hot reload)
npm run build    # Compile TypeScript
npm start        # Run compiled build
```
