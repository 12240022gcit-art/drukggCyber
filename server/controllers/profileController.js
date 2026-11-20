import { authenticatedUser, json, safeUser } from './shared.js';

export async function handleProfileRequest({ method, pathname, request, response, store }) {
  if (method !== 'GET' || pathname !== '/api/profile') return false;

  const user = await authenticatedUser(request, store, response);
  json(response, 200, {
    user: {
      ...safeUser(user),
      phone: user.phone || '',
      bankName: user.bankName || '',
      accountNumber: user.accountNumber || '',
      initials: user.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
      verified: false,
      ordersCount: store.orders.filter((order) => order.buyerId === user.id).length,
      listingsCount: store.submissions.filter((submission) => submission.userId === user.id).length,
      reviewsCount: 0,
    },
  });
  return true;
}
