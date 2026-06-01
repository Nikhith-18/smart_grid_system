import { alerts, analytics, transformers } from '../../data/mockData';
import { mockDelay } from './client';

export const getDashboard = async () => {
  const total = transformers.length;
  const healthy = transformers.filter((item) => item.status === 'NORMAL').length;
  const warning = transformers.filter((item) => ['WARNING', 'ADVISORY'].includes(item.status)).length;
  const critical = transformers.filter((item) => item.status === 'CRITICAL').length;
  const avg = (key) => Math.round(transformers.reduce((sum, item) => sum + item[key], 0) / total);

  return mockDelay({
    widgets: {
      totalTransformers: total,
      healthyTransformers: healthy,
      warningTransformers: warning,
      criticalTransformers: critical,
      averageHealthScore: avg('healthScore'),
      activeAlerts: alerts.filter((alert) => alert.status !== 'Resolved').length,
      averageGridLoad: avg('loadPercentage'),
      systemAvailability: 99.74,
    },
    quickStats: {
      averageTemperature: avg('temperature'),
      averageLoad: avg('loadPercentage'),
      totalPowerConsumption: Number(transformers.reduce((sum, item) => sum + item.consumption, 0).toFixed(1)),
      fleetHealthScore: avg('healthScore'),
    },
    charts: analytics,
    recentAlerts: alerts.slice(0, 4),
    transformers,
  });
};
