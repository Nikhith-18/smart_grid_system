import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 8000,
});

export const mockDelay = (payload, delay = 320) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(structuredClone(payload)), delay);
  });

export const wsUrl = (path) => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}${path}`;
};
