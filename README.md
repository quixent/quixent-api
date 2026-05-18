# Quixent API — Monorepo

Centralized backend for Quixent mini-projects. Each subfolder is an independently deployable service.

## Structure

```
quixent-api/
├── auth/                  # Authentication service (port 5000)
└── match-calculator-api/  # Match calculator service (port 5001)
```

## Services

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| auth | 5000 | quixent-auth | Phone + OTP authentication for all Quixent projects |
| match-calculator | 5001 | matchmaking | Compatibility quiz and matching logic |

## Running Locally

Start both services in separate terminals:

```bash
# Terminal 1 — Auth API
cd auth
npm run dev

# Terminal 2 — Match Calculator
cd match-calculator-api
npm run dev
```

## Prerequisites

- Node.js 18+
- MongoDB running on `localhost:27017`
- npm

## Tech Stack

- TypeScript
- Express.js
- MongoDB + Mongoose
- JWT (access + refresh tokens)
- 2Factor.in (SMS OTP)
