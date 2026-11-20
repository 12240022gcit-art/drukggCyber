import { existsSync } from 'node:fs';
import process from 'node:process';
import { createServer } from 'node:http';

if (existsSync('.env')) process.loadEnvFile('.env');

const { getEncryptionKey } = await import('./security/dataProtection.js');
getEncryptionKey();
const { loadStore, saveStore } = await import('./models/store.js');
const store = await loadStore();
if (store.sessions.length > 0) {
  const invalidatedSessions = store.sessions.length;
  store.sessions = [];
  await saveStore(store);
  console.log(`Cleared ${invalidatedSessions} previous session(s); users must sign in again.`);
}
const { handleApiRequest, startApiServer } = await import('./controllers/apiController.js');

startApiServer(createServer(handleApiRequest));
