import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const Dashboard = lazy(() => import('./pages/DashboardPage'));
const Planner = lazy(() => import('./pages/PlannerPage'));
const Vocals = lazy(() => import('./pages/VocalsPage'));
const Fitness = lazy(() => import('./pages/FitnessPage'));
const Finance = lazy(() => import('./pages/FinancePage'));
const Reading = lazy(() => import('./pages/ReadingPage'));
const Sleep = lazy(() => import('./pages/SleepPage'));
const News = lazy(() => import('./pages/NewsPage'));
const Profile = lazy(() => import('./pages/ProfilePage'));
const Settings = lazy(() => import('./pages/SettingsPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 animate-pulse" />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/vocals" element={<Vocals />} />
        <Route path="/fitness" element={<Fitness />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/reading" element={<Reading />} />
        <Route path="/sleep" element={<Sleep />} />
        <Route path="/news" element={<News />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
