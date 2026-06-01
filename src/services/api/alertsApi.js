import { apiClient } from './client';

export const getAlerts = async () => {
  const { data } = await apiClient.get('/alerts');
  return data;
};
