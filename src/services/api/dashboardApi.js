import { apiClient } from './client';

export const getDashboard = async () => {
  const { data } = await apiClient.get('/dashboard');
  return data;
};
