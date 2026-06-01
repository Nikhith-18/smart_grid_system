export function MetricCard({ icon: Icon, label, value, unit, tone = 'cyan' }) {
  const tones = {
    cyan: 'text-grid-cyan bg-cyan-400/10',
    green: 'text-grid-green bg-emerald-400/10',
    yellow: 'text-grid-yellow bg-yellow-300/10',
    red: 'text-grid-red bg-rose-400/10',
    blue: 'text-grid-blue bg-blue-400/10',
  };

  return (
    <div className="rounded border border-grid-line bg-grid-panel p-4 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-white">{value}</span>
            {unit ? <span className="text-sm text-slate-400">{unit}</span> : null}
          </div>
        </div>
        {Icon ? (
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded ${tones[tone]}`}>
            <Icon size={20} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
