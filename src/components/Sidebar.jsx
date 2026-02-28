import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Mic, Dumbbell, DollarSign,
  BookOpen, Moon, Newspaper, User, Settings, Zap
} from 'lucide-react';

const navGroups = [
  {
    items: [
      { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/planner', icon: Calendar, label: 'Planner' },
      { path: '/vocals', icon: Mic, label: 'Vocals' },
      { path: '/fitness', icon: Dumbbell, label: 'Fitness' },
    ]
  },
  {
    items: [
      { path: '/finance', icon: DollarSign, label: 'Finance' },
      { path: '/reading', icon: BookOpen, label: 'Reading' },
      { path: '/sleep', icon: Moon, label: 'Sleep' },
      { path: '/news', icon: Newspaper, label: 'News' },
    ]
  },
  {
    items: [
      { path: '/profile', icon: User, label: 'Profile' },
      { path: '/settings', icon: Settings, label: 'Settings' },
    ]
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col glass-card rounded-none border-l-0 border-t-0 border-b-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-heading font-bold gradient-text">LifeOS</h1>
          <p className="text-[10px] text-white/30">Personal Dashboard</p>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group, gi) => (
          <div key={gi} className="space-y-1">
            {group.items.map(item => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-white border-l-2 border-indigo-400'
                      : 'text-white/50 hover:text-white/70 hover:bg-white/5'
                  }`}
                >
                  <item.icon size={18} className={active ? 'text-indigo-400' : ''} />
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/5">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-white/5 transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-heading font-bold text-sm">
            S
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white">Stefan</p>
            <p className="text-[10px] text-white/40">EGT Digital</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
