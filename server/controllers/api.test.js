import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { chmod, mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { hashSessionToken } from '../security/sessions.js';

const originalEnvironment = {
  dataEncryptionKey: process.env.DATA_ENCRYPTION_KEY,
  dataFile: process.env.DRUKGG_DATA_FILE,
  nodeEnv: process.env.NODE_ENV,
  trustProxy: process.env.TRUST_PROXY,
};
const testDirectory = await mkdtemp(path.join(os.tmpdir(), 'drukgg-api-test-'));
await chmod(testDirectory, 0o750);
process.env.DATA_ENCRYPTION_KEY = randomBytes(32).toString('base64');
process.env.DRUKGG_DATA_FILE = path.join(testDirectory, 'store.json');
process.env.NODE_ENV = 'test';

const { handleApiRequest } = await import('./apiController.js');
const { loadStore, saveStore } = await import('../models/store.js');
const { SESSION_IDLE_TIMEOUT_MS } = await import('./shared.js');
const server = createServer(handleApiRequest);
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const origin = `http://127.0.0.1:${address.port}`;

test('API enforces cookie auth, role checks, rate limits, and encrypted persistence', async () => {
  const registration = await fetch(`${origin}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: 'test@example.test',
      password: 'secure test password',
    }),
  });
  assert.equal(registration.status, 201);
  const setCookie = registration.headers.get('set-cookie');
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /SameSite=Strict/);
  assert.match(setCookie, /Path=\/api/);
  assert.match(setCookie, /Max-Age=1800/);
  const cookie = setCookie.split(';', 1)[0];
  const token = cookie.split('=', 2)[1];
  const registrationBody = await registration.json();
  assert.equal(registrationBody.token, undefined);
  assert.equal(registrationBody.user.email, 'test@example.test');

  const currentUser = await fetch(`${origin}/api/auth/me`, { headers: { Cookie: cookie } });
  assert.equal(currentUser.status, 200);
  const currentUserBody = await currentUser.json();
  assert.equal(currentUserBody.user.accountNumber, undefined);
  assert.equal(currentUserBody.user.phone, undefined);
  assert.match(currentUser.headers.get('set-cookie'), /Max-Age=1800/);

  const initialStore = await loadStore();
  const storedSession = initialStore.sessions.find((session) => session.tokenHash === hashSessionToken(token));
  const previousActivityAt = Date.now() - 2 * 60 * 1000;
  storedSession.lastActivityAt = previousActivityAt;
  storedSession.expiresAt = previousActivityAt + SESSION_IDLE_TIMEOUT_MS;
  await saveStore(initialStore);

  const refreshedSessionResponse = await fetch(`${origin}/api/auth/me`, { headers: { Cookie: cookie } });
  assert.equal(refreshedSessionResponse.status, 200);
  assert.match(refreshedSessionResponse.headers.get('set-cookie'), /Max-Age=1800/);
  const refreshedStore = await loadStore();
  const refreshedSession = refreshedStore.sessions.find((session) => session.tokenHash === hashSessionToken(token));
  assert.ok(refreshedSession.lastActivityAt > previousActivityAt);

  const store = await loadStore();
  store.messages.push({
    id: 'private-admin-message',
    accountId: 'mlbb-7000',
    userId: 'another-user',
    sender: 'admin',
    text: 'Private response',
  });
  await saveStore(store);
  const accountMessages = await fetch(`${origin}/api/accounts/mlbb-7000/messages`, {
    headers: { Cookie: cookie },
  });
  assert.deepEqual((await accountMessages.json()).messages, []);

  const forbidden = await fetch(`${origin}/api/admin/orders`, { headers: { Cookie: cookie } });
  assert.equal(forbidden.status, 403);

  const invalidContentType = await fetch(`${origin}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: 'not json',
  });
  assert.equal(invalidContentType.status, 415);

  const expiredStore = await loadStore();
  const expiredSession = expiredStore.sessions.find((session) => session.tokenHash === hashSessionToken(token));
  expiredSession.lastActivityAt = Date.now() - SESSION_IDLE_TIMEOUT_MS - 1;
  expiredSession.expiresAt = expiredSession.lastActivityAt + SESSION_IDLE_TIMEOUT_MS;
  await saveStore(expiredStore);
  const expiredSessionResponse = await fetch(`${origin}/api/auth/me`, { headers: { Cookie: cookie } });
  assert.equal(expiredSessionResponse.status, 401);
  assert.match(expiredSessionResponse.headers.get('set-cookie'), /Max-Age=0/);

  const login = await fetch(`${origin}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.test', password: 'secure test password' }),
  });
  assert.equal(login.status, 200);
  const loginCookie = login.headers.get('set-cookie').split(';', 1)[0];
  const logout = await fetch(`${origin}/api/auth/logout`, { method: 'POST', headers: { Cookie: loginCookie } });
  assert.equal(logout.status, 200);
  assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
  const revokedSession = await fetch(`${origin}/api/auth/me`, { headers: { Cookie: loginCookie } });
  assert.equal(revokedSession.status, 401);

  const rateLimitedAttempts = [];
  for (let attempt = 0; attempt < 10; attempt += 1) {
    rateLimitedAttempts.push(await fetch(`${origin}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'missing@example.test', password: 'secure test password' }),
    }));
  }
  assert.equal(rateLimitedAttempts[7].status, 401);
  assert.equal(rateLimitedAttempts[8].status, 429);

  process.env.NODE_ENV = 'production';
  process.env.TRUST_PROXY = 'false';
  const plaintextProductionRequest = await fetch(`${origin}/api/health`);
  assert.equal(plaintextProductionRequest.status, 426);
  process.env.TRUST_PROXY = 'true';
  const proxiedHttpsRequest = await fetch(`${origin}/api/health`, {
    headers: { 'X-Forwarded-Proto': 'https' },
  });
  assert.equal(proxiedHttpsRequest.status, 200);
  assert.match(proxiedHttpsRequest.headers.get('strict-transport-security'), /max-age=31536000/);
  process.env.NODE_ENV = 'test';

  const stored = JSON.parse(await readFile(process.env.DRUKGG_DATA_FILE, 'utf8'));
  assert.equal(stored.format, 'drukgg-aes-256-gcm-v1');
  assert.equal(JSON.stringify(stored).includes('test@example.test'), false);
  assert.equal((await stat(testDirectory)).mode & 0o777, 0o750);
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await rm(testDirectory, { recursive: true, force: true });

  if (originalEnvironment.dataEncryptionKey === undefined) delete process.env.DATA_ENCRYPTION_KEY;
  else process.env.DATA_ENCRYPTION_KEY = originalEnvironment.dataEncryptionKey;
  if (originalEnvironment.dataFile === undefined) delete process.env.DRUKGG_DATA_FILE;
  else process.env.DRUKGG_DATA_FILE = originalEnvironment.dataFile;
  if (originalEnvironment.nodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalEnvironment.nodeEnv;
  if (originalEnvironment.trustProxy === undefined) delete process.env.TRUST_PROXY;
  else process.env.TRUST_PROXY = originalEnvironment.trustProxy;
});
