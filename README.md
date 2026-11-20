# DrukGG Marketplace

DrukGG is a React/Vite gaming-account marketplace with a Node.js API and MongoDB persistence. Accounts, registrations, orders, seller submissions, support messages, and escrow workflow records are stored in MongoDB.

## Project structure

- `src/models/` contains marketplace types, the API client, and feature-specific data access.
- `src/controllers/` contains application state and workflow orchestration.
- `src/views/` contains the feature screens; shared UI lives in `src/components/`.
- `src/components/navigation/` contains the primary navigation menu.
- `server/models/` contains MongoDB persistence and encrypted store migration.
- `server/controllers/` contains API, authentication, and profile handlers; `server/server.js` starts the API.

## Run locally

Requires Node.js 20.12 or later.

1. Install packages with `npm install`.
2. Copy `.env.example` to `.env`. Start MongoDB from `.devcontainer/docker-compose.yml` or set `MONGODB_URI` to your MongoDB connection string. Generate a unique encryption key with `openssl rand -base64 32` and set it as `DATA_ENCRYPTION_KEY`. Set a unique `ADMIN_EMAIL` and strong `ADMIN_PASSWORD` to enable admin sign-in. Keep `.env` and a secure backup of the encryption key out of source control; losing the key makes the encrypted database record unreadable.
3. Start the API and frontend together with `npm run dev`.

The frontend is served by Vite at `http://localhost:5173`; port 4000 is the API. The API root reports its status and `/api/health` is the health endpoint. `npm run dev:api` and `npm run dev:web` can also run either service separately. The API connects to MongoDB before listening and stores users, sessions, accounts, submissions, orders, escrows, messages, and notifications as separate AES-256-GCM encrypted documents in collections with the corresponding names in the `drukgg` database. On startup, a previous encrypted `application_state` record or `server/data/store.json` file is migrated into these collections. `DRUKGG_DATA_FILE` remains available for isolated local tests.

## Main API routes

- `GET /api/health`, `GET /api/accounts`, `GET /api/accounts/:id`
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/profile`, `GET /api/orders`, `POST /api/orders`, `GET /api/listings`, `POST /api/submissions`
- `GET /api/notifications`, `POST /api/notifications/read`, `GET /api/messages`, `POST /api/messages`
- Admin-only `/api/admin/submissions`, `/api/admin/accounts`, `/api/admin/orders`, `/api/admin/escrows`, and `/api/admin/conversations`

User passwords are stored as bcrypt hashes; existing scrypt hashes are upgraded after a successful login. Session tokens are random, held in HttpOnly/SameSite cookies, and stored as hashes. Admin credentials are supplied through environment variables; there is no demo admin bypass.

Production deployments must terminate HTTPS at the API or at a trusted reverse proxy. Set `NODE_ENV=production` to reject plaintext API requests and enable secure session cookies. Only set `TRUST_PROXY=true` when the trusted proxy overwrites `X-Forwarded-Proto` and exposes the API only through that proxy.

## Payments

Orders and payment-status workflow records are persisted, but no bank, wallet, or payment-gateway integration is configured. An administrator may record that payment was verified externally, but these status changes do not hold or transfer funds. The app does not collect or deliver game passwords.

See [security.md](./security.md) for implemented controls, the assignment mapping, verification commands, and deployment limitations.
# drukggCyber
# drukggCyber
