import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

export const ENCRYPTED_STORE_FORMAT = 'drukgg-aes-256-gcm-v1';

export function getEncryptionKey() {
  const encoded = process.env.DATA_ENCRYPTION_KEY?.trim();
  if (!encoded) {
    throw new Error('DATA_ENCRYPTION_KEY is required. Generate a 32-byte key and add it to .env.');
  }

  const key = Buffer.from(encoded, 'base64');
  if (key.length !== 32 || key.toString('base64') !== encoded) {
    throw new Error('DATA_ENCRYPTION_KEY must be a base64-encoded 32-byte key.');
  }
  return key;
}

export function encryptText(plaintext, key = getEncryptionKey()) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

  return {
    format: ENCRYPTED_STORE_FORMAT,
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  };
}

export function decryptText(envelope, key = getEncryptionKey()) {
  if (envelope?.format !== ENCRYPTED_STORE_FORMAT) {
    throw new Error('Unsupported encrypted data format.');
  }

  try {
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(envelope.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(envelope.authTag, 'base64'));
    return Buffer.concat([
      decipher.update(Buffer.from(envelope.ciphertext, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    throw new Error('Encrypted data could not be verified. Check DATA_ENCRYPTION_KEY.');
  }
}

export function encryptStore(store) {
  return encryptText(JSON.stringify(store));
}

export function decryptStore(envelope) {
  return JSON.parse(decryptText(envelope));
}
