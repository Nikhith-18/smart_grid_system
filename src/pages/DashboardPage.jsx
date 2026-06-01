import { useQuery } from '@tanstack/react-query';
import { Activity, AlertTriangle, Cpu, Gauge, Server, ShieldCheck, Thermometer, Zap } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';
import { getDashboard } from '../services/api/dashboardApi';
import { getGrid } from '../services/api/transformerApi';
import { MetricCard } from '../components/common/MetricCard';
import { ChartPanel } from '../components/common/ChartPanel';
import { ErrorBlock, LoadingBlock } from '../components/common/StateBlock';
import { GridMap } from '../components/grid/GridMap';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { useGridStore } from '../store/gridStore';

const tooltipStyle = { background: '#0d1b20', border: '1px solid #24424b', color: '#fff' };
const pieColors = ['#fb7185', '#facc15', '#60a5fa', '#32d583'];

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });
  const { data: grid } = useQuery({ queryKey: ['grid'], queryFn: getGrid });
  const setSelectedTransformerId = useGridStore((state) => state.setSelectedTransformerId);

  if (isLoading) return <LoadingBlock />;
  if (error) return <ErrorBlock />;

  const widgets = data.widgets;
  const quick = data.quickStats;

  return (
    <div>
      <SectionHeader eyebrow="Operational Overview" title="City Grid Health Dashboard" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Server} label="Total Transformers" value={widgets.totalTransformers} />
        <MetricCard icon={ShieldCheck} label="Healthy Transformers" value={widgets.healthyTransformers} tone="green" />
        <MetricCard icon={AlertTriangle} label="Warning Transformers" value={widgets.warningTransformers} tone="yellow" />
        <MetricCard icon={Activity} label="Critical Transformers" value={widgets.criticalTransformers} tone="red" />
        <MetricCard icon={Gauge} label="Average Health Score" value={widgets.averageHealthScore} unit="%" tone="green" />
        <MetricCard icon={AlertTriangle} label="Active Alerts" value={widgets.activeAlerts} tone="yellow" />
        <MetricCard icon={Zap} label="Average Grid Load" value={widgets.averageGridLoad} unit="%" tone="blue" />
        <MetricCard icon={Cpu} label="System Availability" value={widgets.systemAvailability} unit="%" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <ChartPanel title="Health Score Trend">
          <ResponsiveContainer>
            <LineChart data={data.charts.healthTrend}>
              <CartesianGrid stroke="#24424b" strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="health" stroke="#32d583" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Load Distribution">
          <ResponsiveContainer>
            <BarChart data={data.charts.loadDistribution}>
              <CartesianGrid stroke="#24424b" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="load" fill="#39d5ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Alert Statistics">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data.charts.alertStats} dataKey="value" nameKey="name" innerRadius={62} outerRadius={90}>
                {data.charts.alertStats.map((_, index) => <Cell key={index} fill={pieColors[index % pieColors.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Failure Prediction Overview">
          <ResponsiveContainer>
            <AreaChart data={data.charts.failureTrend}>
              <CartesianGrid stroke="#24424b" strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="probability" stroke="#fb7185" fill="#fb718555" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded border border-grid-line bg-grid-panel p-4 shadow-panel">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Map Preview</h3>
            <Link to="/grid" className="text-sm text-cyan-200 hover:text-cyan-100">Open grid</Link>
          </div>
          <div className="h-80">
            {grid ? <GridMap transformers={grid.transformers} gridLines={grid.gridLines} compact onSelect={setSelectedTransformerId} /> : null}
          </div>
        </div>
        <div className="space-y-5">
          <div className="rounded border border-grid-line bg-grid-panel p-4 shadow-panel">
            <h3 className="mb-3 text-sm font-semibold text-white">Recent Alerts</h3>
            <div className="space-y-3">
              {data.recentAlerts.map((alert) => (
                <div key={alert.id} className="rounded border border-grid-line bg-grid-panel2 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-slate-100">{alert.type}</p>
                    <StatusBadge status={alert.severity} />
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{alert.transformerId} - {alert.status}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <MetricCard icon={Thermometer} label="Average Temperature" value={quick.averageTemperature} unit="C" tone="yellow" />
            <MetricCard icon={Zap} label="Total Consumption" value={quick.totalPowerConsumption} unit="MW" tone="blue" />
          </div>
        </div>
      </div>
    </div>
  );
}
