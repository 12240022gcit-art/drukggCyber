import assert from 'node:assert/strict';
import { randomBytes, scryptSync } from 'node:crypto';
import test from 'node:test';
import { authenticatedUser, safeUser, SESSION_IDLE_TIMEOUT_MS, setSessionCookie, validText } from '../controllers/shared.js';
import { decryptText, encryptText } from './dataProtection.js';
import { hashPassword, isValidPassword, verifyUserPassword } from './passwords.js';
import { hashSessionToken } from './sessions.js';

test('AES-256-GCM encrypts and authenticates stored text', () => {
  const key = randomBytes(32);
  const encrypted = encryptText('private store contents', key);

  assert.notEqual(encrypted.ciphertext, 'private store contents');
  assert.equal(decryptText(encrypted, key), 'private store contents');
  assert.throws(() => decryptText({ ...encrypted, ciphertext: randomBytes(16).toString('base64') }, key));
});

test('bcrypt passwords verify and enforce the bcrypt input limit', async () => {
  const password = 'correct horse battery staple';
  const passwordHash = await hashPassword(password);

  assert.match(passwordHash, /^\$2[aby]\$12\$/);
  assert.deepEqual(await verifyUserPassword({ passwordHash }, password), { valid: true, needsUpgrade: false });
  assert.deepEqual(await verifyUserPassword({ passwordHash }, 'incorrect password'), { valid: false, needsUpgrade: false });
  assert.equal(isValidPassword('é'.repeat(36)), true);
  assert.equal(isValidPassword('é'.repeat(37)), false);
});

test('a valid legacy scrypt password is marked for bcrypt upgrade', async () => {
  const password = 'legacy account password';
  const salt = randomBytes(16).toString('hex');
  const user = {
    salt,
    passwordHash: scryptSync(password, salt, 64).toString('hex'),
  };

  assert.deepEqual(await verifyUserPassword(user, password), { valid: true, needsUpgrade: true });
  assert.deepEqual(await verifyUserPassword(user, 'wrong password'), { valid: false, needsUpgrade: false });
});

test('session cookies resolve only to hashed sessions and enforce role checks', async () => {
  const token = randomBytes(32).toString('hex');
  const user = {
    id: 'user-1',
    name: 'Test User',
    email: 'user@example.test',
    role: 'user',
    phone: 'private phone',
    bankName: 'private bank',
    accountNumber: 'private account',
  };
  const store = {
    users: [user],
    sessions: [{
      tokenHash: hashSessionToken(token),
      userId: user.id,
      lastActivityAt: Date.now(),
      expiresAt: Date.now() + SESSION_IDLE_TIMEOUT_MS,
    }],
  };
  const request = { headers: { cookie: `other=value; drukgg_session=${token}` } };
  const response = {
    setHeader(name, value) {
      this.headers = { ...this.headers, [name]: value };
    },
  };

  assert.equal((await authenticatedUser(request, store, response)).id, user.id);
  assert.match(response.headers['Set-Cookie'], /Max-Age=1800/);
  assert.deepEqual(Object.keys(safeUser(user)), ['id', 'name', 'email', 'role', 'createdAt']);
  await assert.rejects(() => authenticatedUser(request, store, response, 'admin'), (error) => error.status === 403);
  const expiredResponse = {
    setHeader(name, value) {
      this.headers = { ...this.headers, [name]: value };
    },
  };
  await assert.rejects(() => authenticatedUser({ headers: { cookie: `drukgg_session=${token}` } }, {
    users: [user],
    sessions: [{
      tokenHash: hashSessionToken(token),
      userId: user.id,
      lastActivityAt: Date.now() - SESSION_IDLE_TIMEOUT_MS - 1,
      expiresAt: Date.now() - 1,
    }],
  }, expiredResponse), (error) => error.status === 401);
  assert.match(expiredResponse.headers['Set-Cookie'], /Max-Age=0/);

  const legacyResponse = {
    setHeader(name, value) {
      this.headers = { ...this.headers, [name]: value };
    },
  };
  await assert.rejects(() => authenticatedUser(request, {
    users: [user],
    sessions: [{
      tokenHash: hashSessionToken(token),
      userId: user.id,
      expiresAt: Date.now() + SESSION_IDLE_TIMEOUT_MS,
    }],
  }, legacyResponse), (error) => error.status === 401);
  assert.match(legacyResponse.headers['Set-Cookie'], /Max-Age=0/);
});

test('session cookie is HttpOnly and SameSite strict', () => {
  const response = {
    setHeader(name, value) {
      this.headers = { ...this.headers, [name]: value };
    },
  };

  setSessionCookie(response, 'abc');
  assert.match(response.headers['Set-Cookie'], /HttpOnly/);
  assert.match(response.headers['Set-Cookie'], /SameSite=Strict/);
  assert.match(response.headers['Set-Cookie'], /Path=\/api/);
  assert.doesNotMatch(response.headers['Set-Cookie'], /Secure/);

  const previousEnvironment = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  setSessionCookie(response, 'abc');
  assert.match(response.headers['Set-Cookie'], /; Secure/);
  if (previousEnvironment === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousEnvironment;
});

test('text validation rejects control characters and oversized input', () => {
  assert.throws(() => validText('unsafe\ntext', 'Message'), (error) => error.status === 400);
  assert.throws(() => validText('x'.repeat(201), 'Message'), (error) => error.status === 400);
  assert.equal(validText('safe text', 'Message'), 'safe text');
});
