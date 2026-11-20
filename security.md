# DrukGG Security Controls

This document records the security controls implemented for the ELE201 secure-coding assignment and the limitations that remain. Automated checks are not a substitute for production deployment review or a penetration test.

## Implemented controls

| Assignment area | Implementation |
| --- | --- |
| Password security | New user passwords use bcrypt with cost 12 and a 72-byte UTF-8 limit. Existing scrypt hashes are verified and upgraded to bcrypt after a successful login. |
| Authentication and authorization | Admin login is disabled until server-side `ADMIN_EMAIL` and `ADMIN_PASSWORD` are configured. Admin routes require an admin session; user records and orders are scoped to the authenticated user. |
| Session protection | The API issues random session tokens in `HttpOnly`, `SameSite=Strict` cookies scoped to `/api`; cookies are `Secure` in production. Sessions persist across API restarts and expire after 30 minutes of inactivity. Authenticated activity refreshes the cookie and server-side expiry. Only SHA-256 token hashes are persisted. Logout revokes the session. |
| Encryption and database access | Each MongoDB user, session, account, submission, order, escrow, message, and notification is stored as a separate AES-256-GCM encrypted document using a required, externally configured 32-byte key. A legacy encrypted `application_state` record is migrated into these collections on startup. An existing JSON store is imported if MongoDB has no records. `DRUKGG_DATA_FILE` is retained for isolated tests. |
| Transport security | Production API requests require HTTPS. The API sets HSTS on secure requests. `TRUST_PROXY=true` is only for a trusted TLS-terminating proxy that overwrites `X-Forwarded-Proto`. |
| Input validation | JSON request bodies are capped at 64 KiB; content type and object shape are checked. Authentication, listings, orders, messages, admin updates, and marketplace filters validate types, lengths, ranges, and supported values server-side. |
| Output and privacy | React renders user strings as text. Session responses omit phone and banking details; the authenticated profile endpoint returns a user's own details. Seller payout account data is reduced to its last four digits before persistence. Game passwords, one-time codes, recovery keys, and login cookies are not collected. |
| Abuse and errors | Login and registration requests are limited to 10 attempts per minute per remote address. Unexpected API errors are logged as structured JSON without request bodies, passwords, cookies, or stack traces; clients receive a generic error and request ID. |
| Response protections | API responses set `no-store`, `nosniff`, frame-denial, referrer, permissions, and restrictive content-security headers. |
| User-facing safeguards | Seller and checkout screens warn users not to share account secrets and explain that payment is manually arranged rather than processed or held by an automated gateway. |

## Configuration and operation

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI` to the MongoDB connection string. Generate a unique key with `openssl rand -base64 32` and set `DATA_ENCRYPTION_KEY` in `.env`.
3. Configure a unique admin email and strong password if admin access is needed. Never commit `.env` or share the encryption key.
4. Back up the encryption key separately from MongoDB backups. Without the matching key, application data cannot be decrypted.
5. On startup, a legacy `application_state` document or existing `server/data/store.json` is migrated into the separate collections if needed. Keep a protected backup until the migration has been verified.
6. For production, terminate TLS at the API or a trusted reverse proxy, set `NODE_ENV=production`, and enable `TRUST_PROXY=true` only when the proxy is configured to overwrite the forwarded protocol header.

The automated tests cover authenticated encryption and tampering, bcrypt and legacy-hash handling, session hashing and role checks, cookie attributes, API rate limits, HTTPS enforcement, encrypted persistence, and privacy boundaries. They do not constitute a full external security assessment.

## Known limitations

- The application has no integrated payment processor; order and escrow statuses are workflow records, not evidence that funds are held or transferred.
- TLS certificates, secure proxy configuration, secret storage/rotation, backups, and monitoring must be configured by the deployment operator.
- Email verification, password reset, multi-factor authentication, identity verification, and account recovery are not implemented. The interface must not be interpreted as proof that these checks occurred.
- Rate limiting is in-memory and per API process; production deployments with multiple instances should use a shared limiter at the trusted edge.
- This project has not undergone a penetration test. Review the current dependency audit and deployment configuration before production use.
