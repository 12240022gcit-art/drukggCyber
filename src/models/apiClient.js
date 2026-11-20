const LEGACY_TOKEN_KEY = 'drukgg_session'
export const SESSION_EXPIRED_EVENT = 'drukgg:session-expired'
let sessionActive = false;

function removeLegacyToken() {
  try {
    globalThis.localStorage?.removeItem(LEGACY_TOKEN_KEY);
  } catch (error) {
    if (!(error instanceof DOMException && error.name === 'SecurityError')) throw error;
  }
}

removeLegacyToken();

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function hasSession() {
  return sessionActive;
}

export function setSessionActive() {
  sessionActive = true;
}

export function clearSession() {
  sessionActive = false;
  removeLegacyToken();
}

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {})
  headers.set('Accept', 'application/json')
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')
  let response
  try {
    response = await fetch(path, {
      ...options,
      headers,
      credentials: 'same-origin',
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch (error) {
    throw new ApiError(`Could not connect to the DrukGG server: ${error.message}`, 0)
  }

  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (response.status === 401) {
      const hadSession = sessionActive
      const isAuthAttempt = path === '/api/auth/login' || path === '/api/auth/register'
      clearSession()
      if (hadSession && !isAuthAttempt && typeof window !== 'undefined') {
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
      }
    }
    throw new ApiError(result.error || `Request failed (${response.status}).`, response.status)
  }
  return result
}

export function downloadTextFile(filename, contents) {
  const blob = new Blob([contents], { type: 'text/plain;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}
