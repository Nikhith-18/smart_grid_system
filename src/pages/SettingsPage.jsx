import { Bell, Moon, ServerCog, Shield, SlidersHorizontal, Users } from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';

const sections = [
  { icon: Moon, title: 'Theme Settings', rows: ['Dark theme enabled', 'High contrast telemetry colors', 'Compact dashboard density'] },
  { icon: Bell, title: 'Notification Preferences', rows: ['Critical alerts: push and email', 'Warning alerts: dashboard and email', 'Daily health digest enabled'] },
  { icon: SlidersHorizontal, title: 'System Configuration', rows: ['Sampling interval: 3 seconds', 'Prediction horizon: 90 days', 'RUL model: fleet baseline v2'] },
  { icon: ServerCog, title: 'API Configuration', rows: ['Base URL: /api', 'WebSocket stream: mock://transformers/live', 'Retry policy: 1 retry'] },
  { icon: Users, title: 'User Management Placeholder', rows: ['Operator role', 'Maintenance engineer role', 'Admin approval workflow'] },
  { icon: Shield, title: 'Security', rows: ['Audit logging enabled', 'Token rotation placeholder', 'RBAC ready'] },
];

export default function SettingsPage() {
  return (
    <div>
      <SectionHeader eyebrow="Configuration" title="Settings" />
      <div className="grid gap-5 lg:grid-cols-2">
        {sections.map(({ icon: Icon, title, rows }) => (
          <section key={title} className="rounded border border-grid-line bg-grid-panel p-5 shadow-panel">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded bg-cyan-400/10 text-grid-cyan">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-white">{title}</h3>
            </div>
            <div className="space-y-3">
              {rows.map((row) => (
                <label key={row} className="flex items-center justify-between gap-4 rounded border border-grid-line bg-grid-panel2 px-3 py-3 text-sm text-slate-300">
                  <span>{row}</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-cyan-300" />
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
