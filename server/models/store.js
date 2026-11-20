import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';
import { initialStore } from '../seed.js';
import { decryptText, decryptStore, ENCRYPTED_STORE_FORMAT, encryptText, encryptStore } from '../security/dataProtection.js';
import { hashSessionToken } from '../security/sessions.js';

const baseDirectory = path.dirname(fileURLToPath(import.meta.url));
const usesCustomDataFile = Boolean(process.env.DRUKGG_DATA_FILE);
const storePath = usesCustomDataFile
  ? path.resolve(process.env.DRUKGG_DATA_FILE)
  : path.join(baseDirectory, '..', 'data', 'store.json');
const dataDirectory = path.dirname(storePath);
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/drukgg';
const mongoDatabaseName = new URL(mongoUri).pathname.replace(/^\/+/, '') || 'drukgg';
const mongoClient = usesCustomDataFile ? null : new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 });
const legacyDocumentId = 'primary';
const collectionNames = [
  'users',
  'sessions',
  'accounts',
  'submissions',
  'orders',
  'escrows',
  'messages',
  'notifications',
];
let mongoConnection;
let mongoConnectedLogged = false;
let writeQueue = Promise.resolve();

function normalizeStore(store) {
  let changed = false;
  for (const session of store.sessions || []) {
    if (session.token && !session.tokenHash) {
      session.tokenHash = hashSessionToken(session.token);
      delete session.token;
      changed = true;
    }
  }
  return { store, changed };
}

async function getMongoDatabase() {
  mongoConnection ||= mongoClient.connect();
  const client = await mongoConnection;
  if (!mongoConnectedLogged) {
    console.log(`MongoDB connection successful (database: ${mongoDatabaseName}).`);
    mongoConnectedLogged = true;
  }
  return client.db(mongoDatabaseName);
}

async function loadFileStore() {
  try {
    const saved = JSON.parse(await readFile(storePath, 'utf8'));
    const store = saved.format === ENCRYPTED_STORE_FORMAT ? decryptStore(saved) : saved;
    const normalized = normalizeStore(store);
    if (saved.format !== ENCRYPTED_STORE_FORMAT || normalized.changed) await saveStore(store);
    return store;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const store = initialStore();
    await saveStore(store);
    return store;
  }
}

async function readMongoCollections(database) {
  const entries = await Promise.all(collectionNames.map(async (name) => {
    const documents = await database.collection(name).find({}).toArray();
    return [name, documents.map((document) => JSON.parse(decryptText(document)))];
  }));
  return Object.fromEntries(entries);
}

function hasMongoRecords(collections) {
  return collectionNames.some((name) => collections[name].length > 0);
}

function documentIdFor(name, record) {
  const id = name === 'sessions' ? record.tokenHash : record.id;
  if (typeof id !== 'string' || !id) {
    throw new Error(`Cannot save a ${name} record without a stable string id.`);
  }
  return id;
}

async function persistMongoStore(store) {
  const database = await getMongoDatabase();
  for (const name of collectionNames) {
    const collection = database.collection(name);
    const records = Array.isArray(store[name]) ? store[name] : [];
    const documents = records.map((record) => ({
      _id: documentIdFor(name, record),
      ...encryptText(JSON.stringify(record)),
    }));

    if (documents.length) {
      await collection.bulkWrite(documents.map((document) => ({
        replaceOne: { filter: { _id: document._id }, replacement: document, upsert: true },
      })));
    }
    await collection.deleteMany({ _id: { $nin: documents.map((document) => document._id) } });
  }
}

async function readLegacyMongoStore(database) {
  const legacy = await database.collection('application_state').findOne({ _id: legacyDocumentId });
  return legacy ? decryptStore(legacy) : null;
}

async function importLegacyFileStore() {
  try {
    const saved = JSON.parse(await readFile(storePath, 'utf8'));
    return saved.format === ENCRYPTED_STORE_FORMAT ? decryptStore(saved) : saved;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return initialStore();
  }
}

export async function loadStore() {
  if (usesCustomDataFile) return loadFileStore();

  const database = await getMongoDatabase();
  const legacyStore = await readLegacyMongoStore(database);
  if (legacyStore) {
    const { store } = normalizeStore(legacyStore);
    await persistMongoStore(store);
    await database.collection('application_state').deleteOne({ _id: legacyDocumentId });
    console.log('Migrated encrypted application state into separate MongoDB collections.');
    return store;
  }

  const collections = await readMongoCollections(database);
  if (hasMongoRecords(collections)) return normalizeStore(collections).store;

  const { store } = normalizeStore(await importLegacyFileStore());
  await persistMongoStore(store);
  return store;
}

export function saveStore(store) {
  writeQueue = writeQueue.then(async () => {
    if (usesCustomDataFile) {
      await mkdir(dataDirectory, { recursive: true, mode: 0o700 });
      const tempPath = `${storePath}.${process.pid}.tmp`;
      await writeFile(tempPath, JSON.stringify(encryptStore(store)), { encoding: 'utf8', mode: 0o600 });
      await rename(tempPath, storePath);
      return;
    }

    await persistMongoStore(store);
  });
  return writeQueue;
}
