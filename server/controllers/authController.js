import { randomUUID, timingSafeEqual } from 'node:crypto';
import { saveStore } from '../models/store.js';
import { authenticatedUser, clearSessionCookie, createSession, fail, hashSessionToken, json, readSessionCookie, safeUser, setSessionCookie, validText } from './shared.js';
import { hashPassword, isValidPassword, verifyUserPassword } from '../security/passwords.js';

export async function handleAuthRequest({ method, pathname, body, request, response, store }) {
  if (method === 'POST' && pathname === '/api/auth/register') {
    const name = validText(body.name, 'Name');
    const email = validText(body.email, 'Email', 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw fail(400, 'Enter a valid email address.');
    if (!isValidPassword(body.password)) {
      throw fail(400, 'Password must be at least 8 characters and no more than 72 UTF-8 bytes.');
    }
    if (store.users.some((user) => user.email === email)) throw fail(409, 'An account with this email already exists.');
    const passwordHash = await hashPassword(body.password);
    const user = { id: randomUUID(), name, email, role: 'user', passwordHash, createdAt: new Date().toISOString() };
    store.users.push(user);
    await saveStore(store);
    const session = await createSession(store, user);
    setSessionCookie(response, session.token);
    json(response, 201, { user: session.user });
    return true;
  }
  if (method === 'POST' && pathname === '/api/auth/login') {
    const email = validText(body.email, 'Email', 254).toLowerCase();
    if (typeof body.password !== 'string' || Buffer.byteLength(body.password, 'utf8') > 128) {
      throw fail(400, 'Password is required and must be no more than 128 bytes.');
    }
    const password = body.password;
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (body.role === 'admin') {
      if (!adminEmail || !adminPassword) throw fail(503, 'Admin sign-in is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in the server environment.');
      const emailMatch = email === adminEmail;
      const expectedPassword = Buffer.from(adminPassword);
      const suppliedPassword = Buffer.from(password);
      const passwordMatch = expectedPassword.length === suppliedPassword.length
        && timingSafeEqual(expectedPassword, suppliedPassword);
      if (!emailMatch || !passwordMatch) throw fail(401, 'Invalid staff email or password.');
      let admin = store.users.find((user) => user.email === adminEmail);
      if (!admin) {
        admin = { id: randomUUID(), name: 'DrukGG Administrator', email: adminEmail, role: 'admin', createdAt: new Date().toISOString() };
        store.users.push(admin);
      }
      const session = await createSession(store, admin);
      setSessionCookie(response, session.token);
      json(response, 200, { user: session.user });
      return true;
    }
    const user = store.users.find((item) => item.email === email && item.role === 'user');
    if (!user || !isValidPassword(password)) throw fail(401, 'Invalid email or password.');
    const verification = await verifyUserPassword(user, password);
    if (!verification.valid) throw fail(401, 'Invalid email or password.');
    if (verification.needsUpgrade) {
      user.passwordHash = await hashPassword(password);
      delete user.salt;
      await saveStore(store);
    }
    const session = await createSession(store, user);
    setSessionCookie(response, session.token);
    json(response, 200, { user: session.user });
    return true;
  }
  if (method === 'POST' && pathname === '/api/auth/logout') {
    const token = readSessionCookie(request);
    // Expire the browser cookie even if persisting session revocation fails.
    clearSessionCookie(response);
    if (token) {
      const tokenHash = hashSessionToken(token);
      store.sessions = store.sessions.filter((session) => session.tokenHash !== tokenHash);
    }
    await saveStore(store);
    json(response, 200, { ok: true });
    return true;
  }
  if (method === 'GET' && pathname === '/api/auth/check') {
    await authenticatedUser(request, store, response, undefined, { refreshActivity: false });
    json(response, 200, { authenticated: true });
    return true;
  }
  if (method === 'GET' && pathname === '/api/auth/me') {
    const user = await authenticatedUser(request, store, response);
    json(response, 200, { user: safeUser(user) });
    return true;
  }
  return false;
}
