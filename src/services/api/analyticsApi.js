import { apiClient } from './client';

export const getAnalytics = async (_range = '7d') => {
  const { data } = await apiClient.get('/analytics');
  return data;
};
