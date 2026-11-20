import { randomBytes } from 'node:crypto';
import { saveStore } from '../models/store.js';
import { hashSessionToken } from '../security/sessions.js';

export { hashSessionToken };

export const SESSION_COOKIE_NAME = 'drukgg_session';
export const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const SESSION_ACTIVITY_SAVE_INTERVAL_MS = 60 * 1000;

export function json(response, status, value) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  });
  response.end(JSON.stringify(value));
}

export const fail = (status, message) => Object.assign(new Error(message), { status });

export function readSessionCookie(request) {
  const cookies = request.headers.cookie?.split(';') || [];
  const sessionCookie = cookies.map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${SESSION_COOKIE_NAME}=`));
  const token = sessionCookie?.slice(SESSION_COOKIE_NAME.length + 1);
  return /^[\da-f]{64}$/i.test(token || '') ? token : null;
}

export function setSessionCookie(response, token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=${token}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${SESSION_IDLE_TIMEOUT_MS / 1000}${secure}`,
  );
}

export function clearSessionCookie(response) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0${secure}`,
  );
}

export function hasControlCharacters(value) {
  return [...value].some((character) => {
    const code = character.charCodeAt(0);
    return code <= 0x1f || code === 0x7f;
  });
}

export const safeUser = ({ id, name, email, role, createdAt }) => ({
  id,
  name,
  email,
  role,
  createdAt,
});

export async function authenticatedUser(request, store, response, requiredRole, { refreshActivity = true } = {}) {
  const token = readSessionCookie(request);
  if (!token) throw fail(401, 'Please sign in to continue.');
  const tokenHash = hashSessionToken(token);
  const now = Date.now();
  const session = store.sessions.find((item) => item.tokenHash === tokenHash);
  const user = session && store.users.find((item) => item.id === session.userId);
  if (
    !session
    || !user
    || !Number.isFinite(session.lastActivityAt)
    || session.expiresAt <= now
    || now - session.lastActivityAt >= SESSION_IDLE_TIMEOUT_MS
  ) {
    clearSessionCookie(response);
    throw fail(401, 'Your session has expired. Please sign in again.');
  }
  if (requiredRole && user.role !== requiredRole) throw fail(403, 'You do not have permission to perform this action.');
  if (refreshActivity && now - session.lastActivityAt >= SESSION_ACTIVITY_SAVE_INTERVAL_MS) {
    session.lastActivityAt = now;
    session.expiresAt = now + SESSION_IDLE_TIMEOUT_MS;
    await saveStore(store);
  }
  if (refreshActivity) setSessionCookie(response, token);
  return user;
}

export async function createSession(store, user) {
  const token = randomBytes(32).toString('hex');
  const now = Date.now();
  store.sessions = store.sessions.filter((session) => (
    Number.isFinite(session.lastActivityAt)
    && session.expiresAt > now
    && now - session.lastActivityAt < SESSION_IDLE_TIMEOUT_MS
  ));
  store.sessions.push({
    tokenHash: hashSessionToken(token),
    userId: user.id,
    lastActivityAt: now,
    expiresAt: now + SESSION_IDLE_TIMEOUT_MS,
  });
  await saveStore(store);
  return { token, user: safeUser(user) };
}

export function validText(value, label, maxLength = 200) {
  if (typeof value !== 'string') {
    throw fail(400, `${label} is required and must be no more than ${maxLength} characters.`);
  }
  const normalized = value.normalize('NFC').trim();
  if (
    !normalized
    || normalized.length > maxLength
    || hasControlCharacters(normalized)
  ) {
    throw fail(400, `${label} is required and must be no more than ${maxLength} characters.`);
  }
  return normalized;
}
