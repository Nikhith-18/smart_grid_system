export function ChartPanel({ title, children }) {
  return (
    <div className="rounded border border-grid-line bg-grid-panel p-4 shadow-panel">
      <h3 className="mb-4 text-sm font-semibold text-slate-100">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
}
