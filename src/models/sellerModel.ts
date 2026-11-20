import { api } from './apiClient';

export function submitAccount(details: Record<string, string>) {
  return api('/api/submissions', { method: 'POST', body: details });
}
