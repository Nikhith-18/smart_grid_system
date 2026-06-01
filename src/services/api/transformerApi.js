import { apiClient } from './client';

export const getTransformers = async () => {
  const { data } = await apiClient.get('/transformers');
  return data;
};

export const getTransformer = async (id) => {
  const { data } = await apiClient.get(`/transformers/${id}`);
  return data;
};

export const getTransformerLive = async (id) => {
  const { data } = await apiClient.get(`/transformers/${id}`);
  return data;
};

export const getGrid = async () => {
  const { data } = await apiClient.get('/grid');
  return data;
};
