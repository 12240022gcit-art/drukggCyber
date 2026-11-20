import { api } from './apiClient';

export function getAccounts(query = '') {
  const search = query ? `?${query}` : '';
  return api(`/api/accounts${search}`);
}

export function getAccountMessages(accountId: string) {
  return api(`/api/accounts/${encodeURIComponent(accountId)}/messages`);
}

export function sendAccountMessage(accountId: string, text: string) {
  return api(`/api/accounts/${encodeURIComponent(accountId)}/messages`, {
    method: 'POST',
    body: { text },
  });
}
