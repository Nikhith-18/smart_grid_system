import { alerts, getAnomaliesForTransformer, gridLines, transformers } from '../../data/mockData';
import { mockDelay } from './client';

export const getTransformers = async () => mockDelay(transformers);

export const getTransformer = async (id) => {
  const transformer = transformers.find((item) => item.id === id);
  if (!transformer) throw new Error('Transformer not found');
  return mockDelay({
    ...transformer,
    anomalies: getAnomaliesForTransformer(transformer),
    alerts: alerts.filter((alert) => alert.transformerId === id),
  });
};

export const getTransformerLive = async (id) => {
  const transformer = transformers.find((item) => item.id === id);
  if (!transformer) throw new Error('Transformer not found');
  return mockDelay({
    id,
    temperature: transformer.temperature,
    oilTemperature: transformer.oilTemperature,
    loadPercentage: transformer.loadPercentage,
    voltage: transformer.voltage,
    current: transformer.current,
    powerFactor: transformer.powerFactor,
    moistureLevel: transformer.moistureLevel,
    partialDischarge: transformer.partialDischarge,
    vibrationLevel: transformer.vibrationLevel,
    healthScore: transformer.healthScore,
    failureProbability: transformer.failureProbability,
    remainingUsefulLife: transformer.remainingUsefulLife,
  }, 220);
};

export const getGrid = async () => mockDelay({ transformers, gridLines });
