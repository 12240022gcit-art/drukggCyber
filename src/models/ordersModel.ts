import { api } from './apiClient';

export function getOrders() {
  return api('/api/orders');
}

export function getListings() {
  return api('/api/listings');
}

export function placeOrder(accountId: string, paymentMethod: string) {
  return api('/api/orders', {
    method: 'POST',
    body: { accountId, paymentMethod },
  });
}

export function updateListingPrice(listingId: string, price: number) {
  return api(`/api/listings/${encodeURIComponent(listingId)}`, {
    method: 'PATCH',
    body: { price },
  });
}
