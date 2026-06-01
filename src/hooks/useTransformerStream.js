import { useEffect, useMemo, useState } from 'react';
import { wsUrl } from '../services/api/client';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const jitter = (value, amount, min, max, decimals = 0) =>
  Number(clamp(value + (Math.random() - 0.5) * amount, min, max).toFixed(decimals));

export const useTransformerStream = (transformer) => {
  const [live, setLive] = useState(transformer);
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setLive(transformer);
    setEvents([]);
  }, [transformer]);

  useEffect(() => {
    if (!transformer) return undefined;

    const socket = new WebSocket(wsUrl('/ws/transformers'));

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onerror = () => setConnected(false);
    socket.onmessage = (message) => {
      try {
        const payload = JSON.parse(message.data);
        const next = payload.transformers?.find((item) => item.id === transformer.id);
        if (!next) return;
        setLive((current) => ({ ...current, ...next }));
      } catch {
        setConnected(false);
      }
    };

    return () => {
      socket.close();
      setConnected(false);
    };
  }, [transformer]);

  useEffect(() => {
    if (!transformer || connected) return undefined;

    const timer = window.setInterval(() => {
      setLive((current) => {
        const next = {
          ...current,
          temperature: jitter(current.temperature, 4, 45, 110),
          oilTemperature: jitter(current.oilTemperature, 3, 40, 105),
          loadPercentage: jitter(current.loadPercentage, 6, 20, 100),
          voltage: jitter(current.voltage, 3, current.voltage * 0.95, current.voltage * 1.04),
          current: jitter(current.current, 12, 80, 430),
          powerFactor: jitter(current.powerFactor, 0.03, 0.82, 0.99, 2),
          moistureLevel: jitter(current.moistureLevel, 1.6, 4, 35),
          vibrationLevel: jitter(current.vibrationLevel, 0.04, 0.04, 0.6, 2),
          partialDischarge: jitter(current.partialDischarge, 4, 1, 55),
          expectedTemperature: jitter(current.expectedTemperature, 1.4, 45, 95),
          expectedLoad: jitter(current.expectedLoad, 2.2, 20, 96),
          expectedVoltage: jitter(current.expectedVoltage, 1.2, current.expectedVoltage * 0.97, current.expectedVoltage * 1.03),
          expectedCurrent: jitter(current.expectedCurrent, 5, 80, 390),
          expectedOilTemperature: jitter(current.expectedOilTemperature, 1.2, 40, 90),
        };

        next.failureProbability = jitter(
          current.failureProbability + (next.temperature > 88 || next.loadPercentage > 88 ? 0.8 : -0.4),
          1.5,
          1,
          88,
        );
        next.healthScore = jitter(
          current.healthScore - (next.failureProbability > 30 ? 0.9 : -0.25),
          1.2,
          30,
          99,
        );
        next.remainingUsefulLife = Number(clamp(current.remainingUsefulLife - next.failureProbability / 9000, 0.2, 6).toFixed(1));
        next.riskScore = jitter(current.riskScore + (next.failureProbability > 30 ? 0.8 : -0.25), 1.2, 1, 96);
        next.operationalEfficiency = jitter(current.operationalEfficiency - (next.loadPercentage > 88 ? 0.7 : -0.2), 1.1, 45, 99);
        next.coolingEfficiency = jitter(current.coolingEfficiency - (next.temperature - next.expectedTemperature > 12 ? 0.8 : -0.15), 1.2, 35, 98);
        return next;
      });
    }, 3200);

    return () => window.clearInterval(timer);
  }, [connected, transformer]);

  useEffect(() => {
    if (!live) return;
    const shouldEmit = live.temperature > 90 || live.loadPercentage > 90 || live.moistureLevel > 24;
    if (!shouldEmit || Math.random() > 0.35) return;

    const event = {
      id: `${live.id}-${Date.now()}`,
      label: live.temperature > 90 ? 'Thermal alert' : live.loadPercentage > 90 ? 'Load alert' : 'Moisture alert',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setEvents((current) => [event, ...current].slice(0, 4));
  }, [live]);

  return useMemo(() => ({ live, events }), [live, events]);
};
