export function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200/70">{eyebrow}</p> : null}
        <h2 className="mt-1 text-2xl font-semibold text-white">{title}</h2>
      </div>
      {action}
    </div>
  );
}
