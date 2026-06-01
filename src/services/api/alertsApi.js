import { alerts } from '../../data/mockData';
import { mockDelay } from './client';

export const getAlerts = async () => mockDelay(alerts);
