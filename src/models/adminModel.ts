import { api } from './apiClient';

export function getAdminDashboardData() {
  return Promise.all([
    api('/api/admin/submissions'),
    api('/api/admin/accounts'),
    api('/api/admin/conversations'),
    api('/api/admin/escrows'),
  ]);
}

export function reviewSubmission(id: string, status: 'approved' | 'rejected', rejectionReason?: string) {
  return api(`/api/admin/submissions/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { status, rejectionReason },
  });
}

export function deleteSubmission(id: string) {
  return api(`/api/admin/submissions/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function deleteAccount(id: string) {
  return api(`/api/admin/accounts/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function sendAdminMessage(userId: string, text: string) {
  return api(`/api/admin/conversations/${encodeURIComponent(userId)}/messages`, {
    method: 'POST',
    body: { text },
  });
}

export function updateEscrowStatus(id: string, status: 'held_in_escrow' | 'payout_released') {
  return api(`/api/admin/escrows/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { status },
  });
}
