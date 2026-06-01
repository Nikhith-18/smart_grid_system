import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { getTransformer, getTransformers } from '../services/api/transformerApi';
import { SectionHeader } from '../components/common/SectionHeader';
import { ErrorBlock, LoadingBlock } from '../components/common/StateBlock';
import { StatusBadge } from '../components/common/StatusBadge';
import { DigitalTwinPanel } from '../components/twin/DigitalTwinPanel';
import { useGridStore } from '../store/gridStore';

export default function TransformersPage() {
  const [sortKey, setSortKey] = useState('id');
  const [page, setPage] = useState(1);
  const { tableFilters, setTableFilters, selectedTransformerId, setSelectedTransformerId } = useGridStore();
  const { data, isLoading, error } = useQuery({ queryKey: ['transformers'], queryFn: getTransformers });
  const { data: selected } = useQuery({
    queryKey: ['transformer', selectedTransformerId],
    queryFn: () => getTransformer(selectedTransformerId),
    enabled: Boolean(selectedTransformerId),
  });

  const rows = useMemo(() => {
    if (!data) return [];
    return data
      .filter((item) => tableFilters.status === 'ALL' || item.status === tableFilters.status)
      .filter((item) => `${item.id} ${item.location}`.toLowerCase().includes(tableFilters.search.toLowerCase()))
      .sort((a, b) => String(a[sortKey]).localeCompare(String(b[sortKey]), undefined, { numeric: true }));
  }, [data, tableFilters, sortKey]);

  if (isLoading) return <LoadingBlock label="Loading transformer fleet" />;
  if (error) return <ErrorBlock />;

  const pageRows = rows.slice((page - 1) * 5, page * 5);
  const maxPage = Math.max(1, Math.ceil(rows.length / 5));

  return (
    <div>
      <SectionHeader eyebrow="Asset Fleet" title="Transformer Fleet" />
      <div className="rounded border border-grid-line bg-grid-panel p-4 shadow-panel">
        <div className="mb-4 flex flex-wrap gap-3">
          <label className="flex min-w-64 flex-1 items-center gap-2 rounded border border-grid-line bg-grid-panel2 px-3 py-2 text-sm text-slate-300">
            <Search size={17} className="text-slate-500" />
            <input
              value={tableFilters.search}
              onChange={(event) => {
                setPage(1);
                setTableFilters({ search: event.target.value });
              }}
              placeholder="Search transformers"
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
            />
          </label>
          <select
            value={tableFilters.status}
            onChange={(event) => {
              setPage(1);
              setTableFilters({ status: event.target.value });
            }}
            className="rounded border border-grid-line bg-grid-panel2 px-3 py-2 text-sm text-slate-200 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="NORMAL">Normal</option>
            <option value="ADVISORY">Advisory</option>
            <option value="WARNING">Warning</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-grid-line text-xs uppercase tracking-[0.12em] text-slate-400">
              <tr>
                {['id', 'location', 'status', 'temperature', 'loadPercentage', 'healthScore', 'remainingUsefulLife', 'failureProbability'].map((key) => (
                  <th key={key} className="cursor-pointer whitespace-nowrap px-3 py-3" onClick={() => setSortKey(key)}>
                    {key.replace(/([A-Z])/g, ' $1')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedTransformerId(item.id)}
                  className="cursor-pointer border-b border-grid-line/70 transition hover:bg-cyan-300/8"
                >
                  <td className="px-3 py-3 font-semibold text-white">{item.id}</td>
                  <td className="px-3 py-3 text-slate-300">{item.location}</td>
                  <td className="px-3 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-3 py-3">{item.temperature} C</td>
                  <td className="px-3 py-3">{item.loadPercentage}%</td>
                  <td className="px-3 py-3">{item.healthScore}%</td>
                  <td className="px-3 py-3">{item.remainingUsefulLife} yrs</td>
                  <td className="px-3 py-3">{item.failureProbability}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <span>Page {page} of {maxPage}</span>
          <div className="flex gap-2">
            <button className="rounded border border-grid-line px-3 py-1.5 disabled:opacity-40" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
            <button className="rounded border border-grid-line px-3 py-1.5 disabled:opacity-40" disabled={page === maxPage} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      </div>
      <div className="mt-5">{selected ? <DigitalTwinPanel transformer={selected} /> : null}</div>
    </div>
  );
}
