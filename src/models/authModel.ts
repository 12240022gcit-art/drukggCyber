import { api, clearSession, setSessionActive } from './apiClient';

export async function getCurrentUser() {
  const result = await api('/api/auth/me');
  setSessionActive();
  return result;
}

export async function checkSession() {
  return api('/api/auth/check');
}

export async function signIn(credentials: { email: string; password: string }, role: 'user' | 'admin' = 'user') {
  const result = await api('/api/auth/login', {
    method: 'POST',
    body: { ...credentials, role },
  });
  setSessionActive();
  return result.user;
}

export async function register(credentials: { name: string; email: string; password: string }) {
  const result = await api('/api/auth/register', {
    method: 'POST',
    body: credentials,
  });
  setSessionActive();
  return result.user;
}

export async function signOut() {
  try {
    await api('/api/auth/logout', { method: 'POST' });
  } finally {
    clearSession();
  }
}
