import { api } from './apiClient';

export function getNotifications() {
  return api('/api/notifications');
}

export function getSupportMessages() {
  return api('/api/messages');
}

export function sendSupportMessage(text: string) {
  return api('/api/messages', { method: 'POST', body: { text } });
}

export function markNotificationsRead() {
  return api('/api/notifications/read', { method: 'POST' });
}
