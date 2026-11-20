import { spawn } from 'node:child_process';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const viteCli = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url));
const children = new Set();
let shuttingDown = false;

process.once('SIGINT', () => stop());
process.once('SIGTERM', () => stop());

function stop(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  process.exitCode = exitCode;
  for (const child of children) child.kill('SIGTERM');
}

function start(name, command, args) {
  const child = spawn(command, args, { stdio: 'inherit' });
  children.add(child);
  child.on('error', (error) => {
    console.error(`Could not start ${name}: ${error.message}`);
    stop(1);
  });
  child.on('exit', (code, signal) => {
    children.delete(child);
    if (!shuttingDown) {
      if (code !== 0) console.error(`${name} exited with ${signal || code || 'an unknown error'}.`);
      stop(code ?? 1);
    }
  });
  return child;
}

async function isApiRunning() {
  try {
    const response = await fetch('http://127.0.0.1:4000/api/health');
    if (!response.ok) return false;
    const health = await response.json();
    return health.status === 'ok';
  } catch {
    return false;
  }
}

async function isAppRunning() {
  try {
    const [pageResponse, healthResponse] = await Promise.all([
      fetch('http://127.0.0.1:5173/'),
      fetch('http://127.0.0.1:5173/api/health'),
    ]);
    if (!pageResponse.ok || !healthResponse.ok) return false;
    const [page, health] = await Promise.all([pageResponse.text(), healthResponse.json()]);
    return page.includes('<div id="root"></div>') && health.status === 'ok';
  } catch {
    return false;
  }
}

async function waitForApi() {
  const deadline = Date.now() + 10_000;
  let lastFailure = 'no health response';
  const api = start('DrukGG API', process.execPath, ['server/server.js']);
  while (!shuttingDown && Date.now() < deadline) {
    try {
      const response = await fetch('http://127.0.0.1:4000/api/health');
      if (response.ok) return;
      lastFailure = `health endpoint returned HTTP ${response.status}`;
    } catch (error) {
      lastFailure = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (api.exitCode !== null) return;
  }
  if (!shuttingDown) {
    console.error(`DrukGG API did not become ready at http://localhost:4000: ${lastFailure}`);
    stop(1);
  }
}

if (await isAppRunning()) {
  console.log('DrukGG is already running at http://localhost:5173.');
} else {
  if (!await isApiRunning()) await waitForApi();
  if (!shuttingDown) start('Vite', process.execPath, [viteCli, ...process.argv.slice(2)]);
}
