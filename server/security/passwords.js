import { timingSafeEqual, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import bcrypt from 'bcryptjs';

const scrypt = promisify(scryptCallback);
const BCRYPT_ROUNDS = 12;
export const MAX_PASSWORD_BYTES = 72;

export function isValidPassword(password) {
  return typeof password === 'string'
    && password.length >= 8
    && Buffer.byteLength(password, 'utf8') <= MAX_PASSWORD_BYTES;
}

export function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyUserPassword(user, password) {
  if (user.passwordHash?.startsWith('$2')) {
    return { valid: await bcrypt.compare(password, user.passwordHash), needsUpgrade: false };
  }

  if (!/^[\da-f]{32}$/i.test(user.salt || '') || !/^[\da-f]{128}$/i.test(user.passwordHash || '')) {
    return { valid: false, needsUpgrade: false };
  }

  const suppliedHash = await scrypt(password, user.salt, 64);
  const storedHash = Buffer.from(user.passwordHash, 'hex');
  const valid = storedHash.length === suppliedHash.length && timingSafeEqual(storedHash, suppliedHash);
  return { valid, needsUpgrade: valid };
}
