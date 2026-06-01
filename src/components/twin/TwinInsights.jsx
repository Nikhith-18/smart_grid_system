import { useMemo, useState } from 'react';
import { AlertTriangle, BrainCircuit, ChevronDown, History, Info, Wrench } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { StatusBadge } from '../common/StatusBadge';

const tooltipStyle = { background: '#0d1b20', border: '1px solid #24424b', color: '#fff' };
const ranges = ['24 Hours', '7 Days', '30 Days', '90 Days', '1 Year'];

const getDeviationStatus = (value, minor, major) => {
  const abs = Math.abs(value);
  if (abs >= major) return { label: 'Anomaly Detected', tone: 'red' };
  if (abs >= minor) return { label: 'Minor Deviation', tone: 'yellow' };
  return { label: 'Normal', tone: 'green' };
};

const toneClass = {
  green: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100',
  yellow: 'border-yellow-300/30 bg-yellow-300/10 text-yellow-100',
  red: 'border-rose-400/35 bg-rose-400/10 text-rose-100',
  blue: 'border-blue-400/30 bg-blue-400/10 text-blue-100',
};

export function TwinSyncBanner({ transformer }) {
  const tone = {
    Synced: 'green',
    Learning: 'blue',
    Degraded: 'yellow',
    Disconnected: 'red',
  }[transformer.twinStatus] || 'green';

  return (
    <div className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded border px-4 py-3 ${toneClass[tone]}`}>
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 rounded-full bg-current shadow-[0_0_18px_currentColor]" />
        <div>
          <p className="text-xs uppercase tracking-[0.16em] opacity-75">Digital Twin Synchronization Status</p>
          <p className="font-semibold">{transformer.twinStatus}</p>
        </div>
      </div>
      <p className="text-sm opacity-85">Model accuracy {transformer.predictionAccuracy}% - Last telemetry frame synced moments ago</p>
    </div>
  );
}

export function PhysicalTwinComparison({ live }) {
  const rows = [
    ['Temperature', live.temperature, live.expectedTemperature, 'C', 5, 14],
    ['Load', live.loadPercentage, live.expectedLoad, '%', 6, 14],
    ['Voltage', live.voltage, live.expectedVoltage, 'kV', 3, 9],
    ['Current', live.current, live.expectedCurrent, 'A', 20, 50],
    ['Oil Temperature', live.oilTemperature, live.expectedOilTemperature, 'C', 5, 13],
  ];

  return (
    <section className="rounded border border-grid-line bg-grid-panel2 p-4">
      <h4 className="mb-4 text-sm font-semibold text-white">Physical vs Digital Twin</h4>
      <div className="grid gap-4 xl:grid-cols-3">
        <TwinColumn title="Physical Asset" rows={rows.map(([label, actual, , unit]) => [label, actual, unit])} />
        <TwinColumn title="Digital Twin Prediction" rows={rows.map(([label, , expected, unit]) => [`Expected ${label}`, expected, unit])} />
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Deviation Analysis</p>
          <div className="space-y-3">
            {rows.slice(0, 3).map(([label, actual, expected, unit, minor, major]) => {
              const deviation = Number((actual - expected).toFixed(unit === 'kV' ? 1 : 0));
              const status = getDeviationStatus(deviation, minor, major);
              return (
                <div key={label} className={`rounded border p-3 ${toneClass[status.tone]}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm">{label} Deviation</span>
                    <span className="font-semibold">{deviation > 0 ? '+' : ''}{deviation}{unit}</span>
                  </div>
                  <p className="mt-1 text-xs opacity-80">{status.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function TwinColumn({ title, rows }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{title}</p>
      <div className="space-y-3">
        {rows.map(([label, value, unit]) => (
          <div key={label} className="rounded border border-grid-line bg-grid-panel p-3">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="mt-1 text-lg font-semibold text-white">{value} <span className="text-xs font-normal text-slate-400">{unit}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TwinIntelligence({ live }) {
  return (
    <section className="rounded border border-grid-line bg-grid-panel2 p-4">
      <div className="mb-4 flex items-center gap-2">
        <BrainCircuit size={18} className="text-grid-cyan" />
        <h4 className="text-sm font-semibold text-white">Digital Twin Intelligence</h4>
      </div>
      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        <ProgressRing value={live.healthScore} label="Health Score" />
        <div className="grid gap-3 sm:grid-cols-2">
          <InsightMetric label="Failure Probability" value={live.failureProbability} unit="%" />
          <InsightMetric label="Risk Score" value={live.riskScore} unit="/100" />
          <InsightMetric label="Remaining Useful Life" value={live.remainingUsefulLife} unit="yrs" />
          <InsightMetric label="Operational Efficiency" value={live.operationalEfficiency} unit="%" />
        </div>
      </div>
    </section>
  );
}

function ProgressRing({ value, label }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="grid place-items-center">
      <svg className="h-36 w-36 -rotate-90" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="transparent" stroke="#1f3941" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="transparent"
          stroke={value > 80 ? '#32d583' : value > 60 ? '#facc15' : '#fb7185'}
          strokeLinecap="round"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="-mt-24 text-center">
        <p className="text-3xl font-semibold text-white">{value}%</p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function InsightMetric({ label, value, unit }) {
  return (
    <div className="rounded border border-grid-line bg-grid-panel p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value} <span className="text-xs font-normal text-slate-400">{unit}</span></p>
    </div>
  );
}

export function OperationalModel({ live }) {
  const labels = [
    ['Load Factor', `${live.loadPercentage}%`, loadRegion(live.loadPercentage), 'Ratio between present load and rated capacity.'],
    ['Thermal Condition', `${live.temperature}C`, thermalRegion(live.temperature), 'Thermal state inferred from winding and oil temperatures.'],
    ['Cooling Efficiency', `${live.coolingEfficiency}%`, efficiencyRegion(live.coolingEfficiency), 'Estimated cooling system effectiveness against expected thermal curve.'],
    ['Operating Region', live.operatingRegion, live.operatingRegion, 'Digital twin operating envelope classification.'],
  ];

  return (
    <section className="rounded border border-grid-line bg-grid-panel2 p-4">
      <h4 className="mb-4 text-sm font-semibold text-white">Transformer Operational Model</h4>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {labels.map(([label, value, status, help]) => (
          <div key={label} title={help} className="rounded border border-grid-line bg-grid-panel p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs text-slate-400">{label}</p>
              <Info size={14} className="text-slate-500" />
            </div>
            <p className="mb-2 text-lg font-semibold text-white">{value}</p>
            <StatusBadge status={status.toUpperCase() === 'OPTIMAL' ? 'NORMAL' : status.toUpperCase()} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function HistoricalAnalysis({ live }) {
  const [range, setRange] = useState('7 Days');
  const data = useMemo(() => buildHistory(live, range), [live, range]);
  const [refArea, setRefArea] = useState({ left: null, right: null });

  return (
    <section className="rounded border border-grid-line bg-grid-panel2 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-white">Historical Analysis</h4>
        <div className="flex flex-wrap rounded border border-grid-line bg-grid-panel p-1">
          {ranges.map((item) => (
            <button key={item} onClick={() => setRange(item)} className={`rounded px-3 py-1.5 text-xs transition ${range === item ? 'bg-cyan-300/15 text-cyan-100' : 'text-slate-400 hover:text-white'}`}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <HistoryChart title="Temperature Trend" data={data} keys={['temperature', 'expectedTemperature']} colors={['#facc15', '#39d5ff']} refArea={refArea} setRefArea={setRefArea} />
        <HistoryChart title="Load Trend" data={data} keys={['load', 'expectedLoad']} colors={['#60a5fa', '#32d583']} refArea={refArea} setRefArea={setRefArea} />
        <HistoryChart title="Voltage Trend" data={data} keys={['voltage', 'expectedVoltage']} colors={['#c084fc', '#39d5ff']} refArea={refArea} setRefArea={setRefArea} />
        <HistoryChart title="Current Trend" data={data} keys={['current', 'expectedCurrent']} colors={['#fb7185', '#facc15']} refArea={refArea} setRefArea={setRefArea} />
        <HistoryChart title="Oil Temperature Trend" data={data} keys={['oilTemperature', 'expectedOilTemperature']} colors={['#fb923c', '#32d583']} refArea={refArea} setRefArea={setRefArea} />
        <HistoryChart title="Health and Failure Trend" data={data} keys={['healthScore', 'failureProbability']} colors={['#32d583', '#fb7185']} refArea={refArea} setRefArea={setRefArea} />
      </div>
    </section>
  );
}

function HistoryChart({ title, data, keys, colors, refArea, setRefArea }) {
  return (
    <div className="h-64 rounded border border-grid-line bg-grid-panel p-3">
      <p className="mb-2 text-xs font-semibold text-slate-200">{title}</p>
      <ResponsiveContainer>
        <LineChart
          data={data}
          onMouseDown={(event) => setRefArea({ left: event?.activeLabel, right: null })}
          onMouseMove={(event) => refArea.left && setRefArea((current) => ({ ...current, right: event?.activeLabel }))}
          onMouseUp={() => setRefArea({ left: null, right: null })}
        >
          <CartesianGrid stroke="#24424b" strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />
          {keys.map((key, index) => <Line key={key} type="monotone" dataKey={key} stroke={colors[index]} dot={false} strokeWidth={2} />)}
          {refArea.left && refArea.right ? <ReferenceArea x1={refArea.left} x2={refArea.right} strokeOpacity={0.3} fill="#39d5ff" fillOpacity={0.12} /> : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AnomalyTimeline({ items }) {
  return (
    <section className="rounded border border-grid-line bg-grid-panel2 p-4">
      <div className="mb-4 flex items-center gap-2">
        <History size={18} className="text-grid-cyan" />
        <h4 className="text-sm font-semibold text-white">Anomaly Timeline</h4>
      </div>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={`${item.timestamp}-${item.type}`} className="relative grid gap-3 pl-7">
            {index < items.length - 1 ? <span className="absolute left-[7px] top-5 h-full w-px bg-grid-line" /> : null}
            <span className="absolute left-0 top-1 h-4 w-4 rounded-full border border-cyan-200 bg-grid-panel shadow-[0_0_18px_rgba(57,213,255,0.35)]" />
            <div className="rounded border border-grid-line bg-grid-panel p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-white">{item.type}</p>
                <StatusBadge status={item.severity} />
              </div>
              <p className="mt-1 text-xs text-cyan-100">{item.timestamp}</p>
              <p className="mt-2 text-sm text-slate-400">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AlertExplanation({ live, anomalies }) {
  const [open, setOpen] = useState(true);
  const alert = anomalies.find((item) => item.severity !== 'NORMAL') || anomalies[0];
  const tempDeviation = live.temperature - live.expectedTemperature;

  return (
    <section className="rounded border border-grid-line bg-grid-panel2">
      <button className="flex w-full items-center justify-between gap-3 p-4 text-left" onClick={() => setOpen((value) => !value)}>
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-grid-yellow" />
          <h4 className="text-sm font-semibold text-white">Why Was This Alert Generated?</h4>
        </div>
        <ChevronDown size={18} className={`text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div className="border-t border-grid-line p-4 text-sm text-slate-300">
          <p><span className="text-slate-500">Alert:</span> {alert.title}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InsightMetric label="Actual Temperature" value={live.temperature} unit="C" />
            <InsightMetric label="Expected Temperature" value={live.expectedTemperature} unit="C" />
            <InsightMetric label="Deviation" value={`${tempDeviation > 0 ? '+' : ''}${tempDeviation}`} unit="C" />
            <InsightMetric label="Cooling Efficiency" value={live.coolingEfficiency} unit="%" />
          </div>
          <p className="mt-3 text-slate-400">Risk Assessment: {live.riskScore >= 70 ? 'High' : live.riskScore >= 35 ? 'Elevated' : 'Controlled'}. {alert.description}</p>
        </div>
      ) : null}
    </section>
  );
}

export function MaintenanceHistory({ items }) {
  return (
    <section className="rounded border border-grid-line bg-grid-panel2 p-4">
      <div className="mb-4 flex items-center gap-2">
        <Wrench size={18} className="text-grid-cyan" />
        <h4 className="text-sm font-semibold text-white">Maintenance History</h4>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={`${item.date}-${item.type}`} className="rounded border border-grid-line bg-grid-panel p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-white">{item.type}</p>
              <p className="text-xs text-cyan-100">{item.date}</p>
            </div>
            <p className="mt-2 text-sm text-slate-400">{item.description}</p>
            <p className="mt-1 text-xs text-emerald-200">{item.result}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function buildHistory(live, range) {
  const count = range === '24 Hours' ? 8 : range === '7 Days' ? 7 : range === '30 Days' ? 10 : range === '90 Days' ? 9 : 12;
  return Array.from({ length: count }, (_, index) => {
    const drift = index - count + 1;
    return {
      time: range === '24 Hours' ? `${index * 3}:00` : `${index + 1}`,
      temperature: live.temperature + Math.round(drift * 1.2),
      expectedTemperature: live.expectedTemperature + Math.round(drift * 0.5),
      load: live.loadPercentage + Math.round(Math.sin(index) * 6),
      expectedLoad: live.expectedLoad + Math.round(Math.sin(index) * 3),
      voltage: live.voltage + Number((Math.cos(index) * 1.8).toFixed(1)),
      expectedVoltage: live.expectedVoltage,
      current: live.current + Math.round(Math.sin(index / 2) * 18),
      expectedCurrent: live.expectedCurrent + Math.round(Math.sin(index / 2) * 8),
      oilTemperature: live.oilTemperature + Math.round(drift * 1.1),
      expectedOilTemperature: live.expectedOilTemperature + Math.round(drift * 0.4),
      healthScore: Math.max(25, live.healthScore - Math.max(0, drift) * 0.6),
      failureProbability: Math.min(95, live.failureProbability + Math.max(0, drift) * 0.8),
    };
  });
}

function loadRegion(value) {
  if (value >= 92) return 'Critical';
  if (value >= 78) return 'Warning';
  if (value >= 55) return 'Normal';
  return 'Optimal';
}

function thermalRegion(value) {
  if (value >= 92) return 'Critical';
  if (value >= 82) return 'Warning';
  if (value >= 68) return 'Normal';
  return 'Optimal';
}

function efficiencyRegion(value) {
  if (value < 55) return 'Critical';
  if (value < 75) return 'Warning';
  if (value < 90) return 'Normal';
  return 'Optimal';
}
