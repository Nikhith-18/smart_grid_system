const statusStyles = {
  NORMAL: 'border-emerald-400/30 bg-emerald-400/12 text-emerald-200',
  ADVISORY: 'border-blue-400/30 bg-blue-400/12 text-blue-200',
  WARNING: 'border-yellow-300/30 bg-yellow-300/12 text-yellow-100',
  CRITICAL: 'border-rose-400/35 bg-rose-400/12 text-rose-200',
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded border px-2 py-1 text-xs font-semibold ${statusStyles[status] || statusStyles.NORMAL}`}>
      {status}
    </span>
  );
}
