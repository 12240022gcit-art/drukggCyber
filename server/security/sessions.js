import { createHash } from 'node:crypto';

export function hashSessionToken(token) {
  return createHash('sha256').update(token).digest('hex');
}
