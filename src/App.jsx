import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import GridOverviewPage from './pages/GridOverviewPage';
import TransformersPage from './pages/TransformersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AlertsPage from './pages/AlertsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/grid" element={<GridOverviewPage />} />
        <Route path="/transformers" element={<TransformersPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
