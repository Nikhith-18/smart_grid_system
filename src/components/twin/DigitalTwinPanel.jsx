import { Activity, Gauge, TimerReset } from 'lucide-react';
import { motion } from 'framer-motion';
import { TransformerModel } from './TransformerModel';
import { StatusBadge } from '../common/StatusBadge';
import { useTransformerStream } from '../../hooks/useTransformerStream';
import { getAnomaliesForTransformer } from '../../data/mockData';
import { riskLabel, statusTone } from '../../utils/status';
import {
  AlertExplanation,
  AnomalyTimeline,
  HistoricalAnalysis,
  MaintenanceHistory,
  OperationalModel,
  PhysicalTwinComparison,
  TwinIntelligence,
  TwinSyncBanner,
} from './TwinInsights';

const infoFields = [
  ['Transformer ID', 'id'],
  ['Location', 'location'],
  ['Rated Capacity', 'ratedCapacity'],
  ['Primary Voltage', 'primaryVoltage'],
  ['Secondary Voltage', 'secondaryVoltage'],
  ['Cooling Type', 'coolingType'],
  ['Year', 'yearOfManufacture'],
];

const operational = [
  ['Temperature', 'temperature', 'C'],
  ['Oil Temperature', 'oilTemperature', 'C'],
  ['Load', 'loadPercentage', '%'],
  ['Voltage', 'voltage', 'kV'],
  ['Current', 'current', 'A'],
  ['Power Factor', 'powerFactor', ''],
  ['Moisture', 'moistureLevel', 'ppm'],
  ['Partial Discharge', 'partialDischarge', 'pC'],
  ['Vibration', 'vibrationLevel', 'g'],
];

export function DigitalTwinPanel({ transformer }) {
  const { live, events } = useTransformerStream(transformer);
  if (!live) return null;

  const risk = riskLabel(live.failureProbability);
  const anomalies = live.anomalies || getAnomaliesForTransformer(live);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded border border-grid-line bg-grid-panel p-4 shadow-panel"
    >
      <TwinSyncBanner transformer={live} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.16em] text-cyan-200/70">Digital Twin Panel</p>
          <h3 className="text-xl font-semibold text-white">{live.name}</h3>
        </div>
        <StatusBadge status={live.status} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.95fr)_1.05fr]">
        <TransformerModel status={live.status} transformer={live} anomalies={anomalies} />
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {infoFields.map(([label, key]) => (
              <div key={key} className="rounded border border-grid-line bg-grid-panel2 p-3">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="mt-1 font-medium text-slate-100">{live[key]}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <HealthTile icon={Gauge} label="Health Score" value={live.healthScore} unit="%" tone={statusTone[risk]} />
            <HealthTile icon={Activity} label="Failure Probability" value={live.failureProbability} unit="%" tone={statusTone[risk]} />
            <HealthTile icon={TimerReset} label="Useful Life" value={live.remainingUsefulLife} unit="yrs" tone="blue" />
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <PhysicalTwinComparison live={live} />
        <div className="grid gap-5 2xl:grid-cols-[0.95fr_1.05fr]">
          <TwinIntelligence live={live} />
          <OperationalModel live={live} />
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-100">Live Operational Data</h4>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {operational.map(([label, key, unit]) => (
              <div key={key} className="rounded border border-grid-line bg-grid-panel2 p-3">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {live[key]} <span className="text-xs font-normal text-slate-400">{unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-100">Anomaly Detection</h4>
          <div className="max-h-72 space-y-3 overflow-auto pr-1 panel-scroll">
            {anomalies.map((item) => (
              <div key={item.title} className="rounded border border-grid-line bg-grid-panel2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-white">{item.title}</p>
                  <StatusBadge status={item.severity} />
                </div>
                <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                <p className="mt-2 text-xs text-cyan-100">{item.detectedTime} - {item.recommendedAction}</p>
              </div>
            ))}
          </div>
          {events.length ? (
            <div className="mt-3 rounded border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-100">
              {events[0].timestamp} - {events[0].label}
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <AnomalyTimeline items={live.anomalyHistory || []} />
        <div className="space-y-5">
          <AlertExplanation live={live} anomalies={anomalies} />
          <MaintenanceHistory items={live.maintenanceHistory || []} />
        </div>
      </div>
      <div className="mt-5">
        <HistoricalAnalysis live={live} />
      </div>
    </motion.section>
  );
}

function HealthTile({ icon: Icon, label, value, unit, tone }) {
  const color = {
    green: 'text-grid-green',
    blue: 'text-grid-blue',
    yellow: 'text-grid-yellow',
    red: 'text-grid-red',
  }[tone] || 'text-grid-cyan';

  return (
    <div className="rounded border border-grid-line bg-grid-panel2 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
        <Icon size={15} className={color} />
        {label}
      </div>
      <p className="text-xl font-semibold text-white">
        {value} <span className="text-xs font-normal text-slate-400">{unit}</span>
      </p>
    </div>
  );
}
