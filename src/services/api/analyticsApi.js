import { analytics, transformers } from '../../data/mockData';
import { mockDelay } from './client';

export const getAnalytics = async (_range = '7d') => {
  const average = (key) => Math.round(transformers.reduce((sum, item) => sum + item[key], 0) / transformers.length);
  return mockDelay({
    ...analytics,
    cards: {
      averageHealth: average('healthScore'),
      peakTemperature: Math.max(...transformers.map((item) => item.temperature)),
      peakLoad: Math.max(...transformers.map((item) => item.loadPercentage)),
      predictedFailures: transformers.filter((item) => item.failureProbability > 20).length,
      maintenanceRisk: 'Elevated',
      predictionAccuracy: Math.round(transformers.reduce((sum, item) => sum + item.predictionAccuracy, 0) / transformers.length),
      averageDeviation: Number((transformers.reduce((sum, item) => sum + Math.abs(item.temperature - item.expectedTemperature), 0) / transformers.length).toFixed(1)),
      modelConfidence: 88,
    },
  });
};
