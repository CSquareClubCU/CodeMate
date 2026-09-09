# ♟️ CodeMate 2.0

> **Same Board. Different Game.** 
> _Chandigarh University · C Square Club_

CodeMate 2.0 is a self-hostable, full-stack competition platform combining **internal 1v1 chess** with **timed debugging MCQs**. Teams share points, use power-ups, unlock premium content, and compete on a live leaderboard. 

Designed with a sleek black, bronze, cream, and red identity.

---

## ✨ Features

- **♟️ Integrated Chess Engine**: Internal matchmaking, real Stockfish analysis, complete history, and board recovery.
- **💻 Coding & Debugging**: Timed MCQs, premium tracing exercises (C, C++, Java, Python, JS), and a local Monaco editor.
- **🏆 Live Economy & Scoring**: Shared team points, net earned logic, quality penalties, and delayed leaderboard updates.
- **🛒 Dynamic Shop**: Transactional shop with six consumable power-ups and premium question sets.
- **🔒 Secure & Real-time**: bcrypt passwords, HTTP-only cookies, Socket.IO synchronization, and role locks.
- **⚙️ Administrator Controls**: Comprehensive team, content, scoring, and settings management with CSV/JSON exports.

---

## 🚀 Quick Start

Requires **Node.js 22.18+** (24 recommended) and npm.

```sh
# 1. Install dependencies
npm install

# 2. Setup database and initial content
npm run setup

# 3. Start development servers
npm run dev
```

Open the exact `FRONTEND_URL` configured in `.env` (default: `http://localhost:5173`). The API listens on port `3001`.

### 🖥️ Running Locally (Single Server)

```sh
npm run build
npm run local
```

Open **http://127.0.0.1:3001**.
_Windows users: After setup and build, you can just double-click `Start-CodeMate.cmd`._

> **Note:** The first setup creates ten demo teams (`TEAM-001` to `TEAM-010`), a random shared team password in `demo-credentials.txt`, and an `event-admin` account in `.data/admin-credentials.txt`. It also seeds questions, power-ups, and a sample match.

### 👥 Participant Guidelines

- **Use separate browsers or browser profiles** for the two participants. Tabs in one profile share the session cookie.
- One team has exactly **one Chess slot** and **one Debugging slot**. A third active login is rejected.
- Replace or review demo questions before an actual event. Demo content is clearly development data.

---

## 🏗️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router, Lucide, react-chessboard, Monaco Editor.
- **Backend**: Express (Node.js), Socket.IO, bcrypt.
- **Database**: PostgreSQL (pg), PGlite (for embedded dev).
- **Engine**: chess.js, Stockfish 17.1.

### Directory Structure

```text
frontend/src/          Interface, pages, hooks and API client
backend/src/           REST, authentication, services and workers
database/migrations/   PostgreSQL schema and constraints
database/seed/         Development content
scripts/               Setup, admin creation and launchers
tests/                 API/domain/engine/socket/load/browser tests
docs/                  Setup, architecture, deployment and evidence
```

---

## 🗄️ Database and Admin

An empty `DATABASE_URL` uses persistent embedded PostgreSQL (PGlite) in `.data/postgres` for development. Production requires standard PostgreSQL (self-hosted or Supabase). No paid APIs are required.

```sh
npm run migrate
npm run create-admin
```

> Admin creation accepts `ADMIN_USERNAME` and `ADMIN_PASSWORD` from the environment, or prompts for a username and generates a password into a private local file. No hardcoded production passwords exist.

---

## 🧪 Verification & Testing

```sh
npm test           # Run all unit tests
npm run build      # Build for production before e2e/load testing
npm run test:e2e   # Run end-to-end browser tests
npm run test:load  # Run stress and load tests
```

- Browser tests use installed Chrome/Edge on Windows or Playwright Chromium (`npx playwright install chromium`).
- Tests use isolated databases and accounts.

---

## 🌐 Deployment

Docker, Compose, Render, and Vercel configurations are included. The simplest deployment serves the UI/API from one Node server behind HTTPS. Production requires your database URL, session secret, domain/TLS, and host.

### Documentation Reference

For detailed guides, please read:
[Setup](docs/SETUP.md) | [Architecture](docs/ARCHITECTURE.md) | [Database](docs/DATABASE.md) | [API](docs/API.md) | [Security](docs/SECURITY.md) | [Deployment](docs/DEPLOYMENT.md) | [Coverage](docs/REQUIREMENTS.md) | [Validation](docs/VALIDATION.md)

---

## 🔧 Troubleshooting

- **Login Issues**: Check credentials, roles, and active sessions. Remember to use separate browser profiles.
- **Origin Error**: `localhost` and `127.0.0.1` are distinct; use the configured origin.
- **Pending Engine**: Check monitoring and Retry analysis. Scores are never guessed.
- **Cannot End Match**: Resolve pending analysis; resume first if paused.
- **Database Locked/Port Occupied**: Stop any previously running local server.
- **Restricted Windows Dev Tools**: Run `npm run build` then `npm run local`.

_Private `.env`, `.data`, and credential files are excluded from Git._
