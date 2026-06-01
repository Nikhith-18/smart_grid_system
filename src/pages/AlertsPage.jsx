import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAlerts } from '../services/api/alertsApi';
import { SectionHeader } from '../components/common/SectionHeader';
import { ErrorBlock, LoadingBlock } from '../components/common/StateBlock';
import { StatusBadge } from '../components/common/StatusBadge';

export default function AlertsPage() {
  const [severity, setSeverity] = useState('ALL');
  const [transformer, setTransformer] = useState('ALL');
  const { data, isLoading, error } = useQuery({ queryKey: ['alerts'], queryFn: getAlerts });

  const rows = useMemo(() => {
    if (!data) return [];
    return data.filter((alert) => (
      (severity === 'ALL' || alert.severity === severity) &&
      (transformer === 'ALL' || alert.transformerId === transformer)
    ));
  }, [data, severity, transformer]);

  if (isLoading) return <LoadingBlock label="Loading alerts" />;
  if (error) return <ErrorBlock />;

  return (
    <div>
      <SectionHeader eyebrow="Anomaly Management" title="Alerts Center" />
      <div className="rounded border border-grid-line bg-grid-panel p-4 shadow-panel">
        <div className="mb-4 flex flex-wrap gap-3">
          <select value={severity} onChange={(event) => setSeverity(event.target.value)} className="rounded border border-grid-line bg-grid-panel2 px-3 py-2 text-sm outline-none">
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="WARNING">Warning</option>
            <option value="ADVISORY">Advisory</option>
            <option value="NORMAL">Normal</option>
          </select>
          <select value={transformer} onChange={(event) => setTransformer(event.target.value)} className="rounded border border-grid-line bg-grid-panel2 px-3 py-2 text-sm outline-none">
            <option value="ALL">All Transformers</option>
            {['T1', 'T2', 'T3', 'T4', 'T5'].map((id) => <option key={id} value={id}>{id}</option>)}
          </select>
          <input type="date" className="rounded border border-grid-line bg-grid-panel2 px-3 py-2 text-sm outline-none" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-grid-line text-xs uppercase tracking-[0.12em] text-slate-400">
              <tr>
                <th className="px-3 py-3">Alert ID</th>
                <th className="px-3 py-3">Transformer</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Severity</th>
                <th className="px-3 py-3">Timestamp</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((alert) => (
                <tr key={alert.id} className="border-b border-grid-line/70">
                  <td className="px-3 py-3 font-semibold text-white">{alert.id}</td>
                  <td className="px-3 py-3">{alert.transformerId}</td>
                  <td className="px-3 py-3">{alert.type}</td>
                  <td className="px-3 py-3"><StatusBadge status={alert.severity} /></td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-300">{new Date(alert.timestamp).toLocaleString()}</td>
                  <td className="px-3 py-3">{alert.status}</td>
                  <td className="min-w-80 px-3 py-3 text-slate-400">{alert.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
