import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';

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
const Login = lazy(() => import('./pages/LoginPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 animate-pulse" />
    </div>
  );
}

function AuthGuard({ children }) {
  const { state } = useApp();
  if (!state.auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/planner" element={<AuthGuard><Planner /></AuthGuard>} />
        <Route path="/vocals" element={<AuthGuard><Vocals /></AuthGuard>} />
        <Route path="/fitness" element={<AuthGuard><Fitness /></AuthGuard>} />
        <Route path="/finance" element={<AuthGuard><Finance /></AuthGuard>} />
        <Route path="/reading" element={<AuthGuard><Reading /></AuthGuard>} />
        <Route path="/sleep" element={<AuthGuard><Sleep /></AuthGuard>} />
        <Route path="/news" element={<AuthGuard><News /></AuthGuard>} />
        <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
        <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
