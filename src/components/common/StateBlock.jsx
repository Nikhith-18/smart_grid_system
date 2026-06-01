export function LoadingBlock({ label = 'Loading telemetry' }) {
  return <div className="grid min-h-56 place-items-center rounded border border-grid-line bg-grid-panel text-slate-400">{label}...</div>;
}

export function ErrorBlock({ message = 'Unable to load data.' }) {
  return <div className="rounded border border-rose-400/30 bg-rose-400/10 p-4 text-rose-100">{message}</div>;
}
