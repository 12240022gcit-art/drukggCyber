import { api } from './apiClient';
import { getListings } from './ordersModel';

export function getProfile() {
  return api('/api/profile');
}

export function getProfileData() {
  return Promise.all([getProfile(), getListings()]);
}
