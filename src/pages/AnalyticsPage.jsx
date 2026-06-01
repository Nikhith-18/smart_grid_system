import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, BrainCircuit, Gauge, Thermometer, TimerReset, Zap } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getAnalytics } from '../services/api/analyticsApi';
import { ChartPanel } from '../components/common/ChartPanel';
import { MetricCard } from '../components/common/MetricCard';
import { SectionHeader } from '../components/common/SectionHeader';
import { ErrorBlock, LoadingBlock } from '../components/common/StateBlock';

const ranges = ['24 Hours', '7 Days', '30 Days', '90 Days'];
const tooltipStyle = { background: '#0d1b20', border: '1px solid #24424b', color: '#fff' };

export default function AnalyticsPage() {
  const [range, setRange] = useState('7 Days');
  const { data, isLoading, error } = useQuery({ queryKey: ['analytics', range], queryFn: () => getAnalytics(range) });

  if (isLoading) return <LoadingBlock label="Loading analytics" />;
  if (error) return <ErrorBlock />;

  return (
    <div>
      <SectionHeader
        eyebrow="Operational Analytics"
        title="Performance and Failure Prediction"
        action={(
          <div className="flex rounded border border-grid-line bg-grid-panel p-1">
            {ranges.map((item) => (
              <button
                key={item}
                onClick={() => setRange(item)}
                className={`rounded px-3 py-1.5 text-sm transition ${range === item ? 'bg-cyan-300/15 text-cyan-100' : 'text-slate-400 hover:text-white'}`}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={Gauge} label="Average Health" value={data.cards.averageHealth} unit="%" tone="green" />
        <MetricCard icon={Thermometer} label="Peak Temperature" value={data.cards.peakTemperature} unit="C" tone="yellow" />
        <MetricCard icon={Zap} label="Peak Load" value={data.cards.peakLoad} unit="%" tone="blue" />
        <MetricCard icon={AlertTriangle} label="Predicted Failures" value={data.cards.predictedFailures} tone="red" />
        <MetricCard icon={TimerReset} label="Maintenance Risk" value={data.cards.maintenanceRisk} tone="yellow" />
      </div>
      <section className="mt-6 rounded border border-grid-line bg-grid-panel p-4 shadow-panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BrainCircuit size={18} className="text-grid-cyan" />
            <h3 className="text-sm font-semibold text-white">Digital Twin Accuracy</h3>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <AccuracyPill label="Prediction Accuracy" value={`${data.cards.predictionAccuracy}%`} />
            <AccuracyPill label="Average Deviation" value={`${data.cards.averageDeviation}C`} />
            <AccuracyPill label="Model Confidence" value={`${data.cards.modelConfidence}%`} />
          </div>
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          <TwinAccuracyChart title="Predicted Temperature vs Actual" data={data.twinAccuracy} actual="actualTemperature" predicted="predictedTemperature" />
          <TwinAccuracyChart title="Predicted Load vs Actual" data={data.twinAccuracy} actual="actualLoad" predicted="predictedLoad" />
        </div>
      </section>
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <Trend title="Temperature Trends" data={data.temperatureTrend} dataKey="temperature" color="#facc15" type="area" />
        <Trend title="Load Trends" data={data.loadTrend} dataKey="load" color="#39d5ff" />
        <Trend title="Health Trends" data={data.healthTrend} dataKey="health" color="#32d583" />
        <Trend title="Failure Probability Trends" data={data.failureTrend} dataKey="probability" color="#fb7185" type="area" />
        <Trend title="Remaining Useful Life Trends" data={data.rulTrend} dataKey="rul" color="#60a5fa" />
        <ChartPanel title="Anomaly Frequency">
          <ResponsiveContainer>
            <BarChart data={data.anomalyFrequency}>
              <CartesianGrid stroke="#24424b" strokeDasharray="3 3" />
              <XAxis dataKey="type" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#39d5ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
    </div>
  );
}

function AccuracyPill({ label, value }) {
  return (
    <div className="rounded border border-grid-line bg-grid-panel2 px-3 py-2">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-semibold text-white">{value}</p>
    </div>
  );
}

function TwinAccuracyChart({ title, data, actual, predicted }) {
  return (
    <div className="h-72 rounded border border-grid-line bg-grid-panel2 p-3">
      <p className="mb-2 text-xs font-semibold text-slate-200">{title}</p>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid stroke="#24424b" strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey={actual} name="Actual" stroke="#facc15" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey={predicted} name="Predicted" stroke="#39d5ff" strokeWidth={3} strokeDasharray="6 6" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function Trend({ title, data, dataKey, color, type = 'line' }) {
  return (
    <ChartPanel title={title}>
      <ResponsiveContainer>
        {type === 'area' ? (
          <AreaChart data={data}>
            <CartesianGrid stroke="#24424b" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey={dataKey} stroke={color} fill={`${color}55`} />
          </AreaChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid stroke="#24424b" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={false} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </ChartPanel>
  );
}
