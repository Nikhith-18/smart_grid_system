import { Activity, Bell, Gauge, LayoutDashboard, LineChart, Map, Settings, UserRound, Zap } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/grid', label: 'Grid Overview', icon: Map },
  { to: '/transformers', label: 'Transformers', icon: Zap },
  { to: '/analytics', label: 'Analytics', icon: LineChart },
  { to: '/alerts', label: 'Alerts', icon: Activity },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function AppShell({ children }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen text-slate-100">
      <header className="sticky top-0 z-40 border-b border-grid-line/80 bg-grid-bg/90 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded bg-cyan-400/15 text-grid-cyan ring-1 ring-cyan-300/30">
              <Zap size={22} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200/80">Digital Twin</p>
              <h1 className="truncate text-base font-semibold sm:text-lg">Smart Grid Digital Twin</h1>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200 md:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.75)]" />
            System Normal
          </div>
          <div className="hidden text-right text-sm text-slate-300 lg:block">
            <div>{now.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}</div>
            <div className="font-mono text-cyan-100">{now.toLocaleTimeString()}</div>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded border border-grid-line bg-grid-panel2 text-slate-300 transition hover:border-cyan-300/50 hover:text-cyan-100" aria-label="Notifications">
            <Bell size={19} />
          </button>
          <button className="grid h-10 w-10 place-items-center rounded border border-grid-line bg-grid-panel2 text-slate-300" aria-label="User profile">
            <UserRound size={19} />
          </button>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-grid-line/80 bg-grid-bg/70 p-4 lg:block">
          <nav className="space-y-2">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-cyan-300/14 text-cyan-100 ring-1 ring-cyan-300/25'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-8 rounded border border-grid-line bg-grid-panel p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Gauge size={17} className="text-grid-cyan" />
              Grid Sync
            </div>
            <div className="h-2 rounded-full bg-slate-800">
              <div className="h-full w-[88%] rounded-full bg-gradient-to-r from-grid-green to-grid-cyan" />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">Live telemetry simulator connected to 5 transformer twins.</p>
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
