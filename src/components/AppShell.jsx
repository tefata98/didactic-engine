import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import useNotifications from '../hooks/useNotifications';
import { useApp } from '../context/AppContext';

export default function AppShell({ children }) {
  const location = useLocation();
  const { state } = useApp();
  const { scheduleReminders } = useNotifications();

  useEffect(() => {
    if (state.settings.notifications) {
      scheduleReminders(state.settings.reminders);
    }
  }, [state.settings.notifications, state.settings.reminders, scheduleReminders]);

  return (
    <div className="min-h-screen bg-base text-white relative">
      {/* Floating Gradient Orbs */}
      <div
        className="floating-orb"
        style={{
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)',
          top: '-5%', left: '-10%',
        }}
      />
      <div
        className="floating-orb"
        style={{
          width: 250, height: 250,
          background: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)',
          bottom: '10%', right: '-5%',
          animationDelay: '2s',
        }}
      />
      <div
        className="floating-orb"
        style={{
          width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(167,139,250,0.08), transparent 70%)',
          top: '40%', right: '20%',
          animationDelay: '4s',
        }}
      />

      {/* Sidebar (desktop) */}
      <Sidebar />

      {/* Main Content */}
      <main className="relative z-10 md:ml-64 pb-32 md:pb-8 min-h-screen safe-top">
        <div key={location.pathname} className="page-enter px-5 pt-6 md:px-8 md:pt-8 max-w-3xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Nav (mobile) */}
      <BottomNav />
    </div>
  );
}
