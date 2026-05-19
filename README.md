# Quixent API

Modular monolith backend for the Match Calculator matrimonial compatibility platform.

---

## Tech Stack

- Node.js + Express
- TypeScript
- MongoDB + Mongoose (two separate databases)
- JWT authentication (access + refresh tokens)
- 2Factor.in SMS for OTP

---

## Architecture

Single Express process on one port. Two sub-modules, each exporting a Router:

```
index.ts              ← entry point, mounts all routers
├── /auth  →  auth/index.ts
└── /match →  match-calculator-api/index.ts
```

---

## Prerequisites

- Node.js >= 18
- MongoDB running locally

---

## Setup

```bash
npm install
```

Create a `.env` file in this folder:

```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGINS=http://localhost:8081

AUTH_MONGO_URI=mongodb://localhost:27017/quixent-auth
MATCH_MONGO_URI=mongodb://localhost:27017/matchmaking

JWT_ACCESS_SECRET=your_secret
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=5

TWOFACTOR_API_KEY=your_2factor_key
TWOFACTOR_OTP_TEMPLATE=General Otp
TWOFACTOR_THANKS_TEMPLATE=General Thanking Template
TWOFACTOR_SENDER_ID=QUIXNT

AUTH_API_URL=http://localhost:5000
```

---

## Running

```bash
# Development (hot reload)
npm run dev

# Production build
npm run build
npm start
```

---

## API Routes

### Root
| Method | Path | Description |
|---|---|---|
| GET | /health | Server health |
| GET | /test | Server test |

### Auth — `/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /auth/send-otp | No | Send OTP to mobile |
| POST | /auth/verify-otp | No | Verify OTP, get token |
| POST | /auth/refresh | No | Refresh access token |
| GET | /auth/me | Yes | Get current user |
| GET | /auth/user/:id | Yes | Get user by ID |
| POST | /auth/profile | Yes | Create/update profile |
| PUT | /auth/update-profile | Yes | Update profile |
| POST | /auth/logout | Yes | Logout |
| DELETE | /auth/delete-account | Yes | Delete account |
| GET | /auth/health | No | Auth module health |
| GET | /auth/test | No | Auth module test |

### Match — `/match`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /match/generate-code | Yes | Generate connect code |
| POST | /match/connect-by-code | Yes | Connect with partner's code |
| GET | /match/matches | Yes | Get active matches |
| GET | /match/questions?matchId= | Yes | Get quiz questions |
| POST | /match/answer | Yes | Submit a single answer |
| GET | /match/score?matchId= | Yes | Get compatibility score |
| GET | /match/messages?matchId= | Yes | Get chat messages |
| POST | /match/message | Yes | Send a message |
| GET | /match/health | No | Match module health |
| GET | /match/test | No | Match module test |

---

## Folder Structure

```
quixent-api/
├── index.ts                        # Entry point — server + DB init
├── package.json
├── tsconfig.json
├── .env
├── auth/
│   ├── index.ts                    # Auth Router export
│   └── src/
│       ├── config/db.ts            # Auth MongoDB connection
│       ├── models/                 # User, Otp, Token, OtpRateLimit
│       ├── routes/auth.routes.ts
│       ├── controllers/
│       ├── services/
│       ├── middleware/
│       └── utils/
└── match-calculator-api/
    ├── index.ts                    # Match Router export
    └── src/
        ├── config/db.ts            # Match MongoDB connection
        ├── models/                 # Match, Answer, Question, Message, ConnectCode
        ├── routes/match.routes.ts
        ├── controllers/
        ├── services/
        └── middleware/
```
