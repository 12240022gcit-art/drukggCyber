function writeLog(level, event, details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...details,
  };
  console[level === 'error' ? 'error' : 'log'](JSON.stringify(entry));
}

export function logError(event, details) {
  writeLog('error', event, details);
}

export function logInfo(event, details) {
  writeLog('info', event, details);
}
