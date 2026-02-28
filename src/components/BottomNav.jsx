import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, Calendar, Mic, Dumbbell, MoreHorizontal, DollarSign, BookOpen, Moon, Newspaper, User, Settings, X } from 'lucide-react';

const mainTabs = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/planner', icon: Calendar, label: 'Planner' },
  { path: '/vocals', icon: Mic, label: 'Vocals', center: true },
  { path: '/fitness', icon: Dumbbell, label: 'Fitness' },
  { path: '/more', icon: MoreHorizontal, label: 'More', isMore: true },
];

const moreItems = [
  { path: '/finance', icon: DollarSign, label: 'Finance', color: '#22c55e' },
  { path: '/reading', icon: BookOpen, label: 'Reading', color: '#c084fc' },
  { path: '/sleep', icon: Moon, label: 'Sleep', color: '#818cf8' },
  { path: '/news', icon: Newspaper, label: 'News', color: '#f59e0b' },
  { path: '/profile', icon: User, label: 'Profile', color: '#a78bfa' },
  { path: '/settings', icon: Settings, label: 'Settings', color: '#6366f1' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isMoreActive = moreItems.some(item => isActive(item.path));

  return (
    <>
      {/* More Drawer */}
      {showMore && (
        <div className="fixed inset-0 z-50" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 glass-card rounded-b-none p-6 pb-8 animate-slideUp"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-heading font-semibold text-white">More</h3>
              <button onClick={() => setShowMore(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <X size={16} className="text-white/70" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {moreItems.map(item => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setShowMore(false); }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all active:scale-95 ${
                    isActive(item.path) ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${item.color}20` }}
                  >
                    <item.icon size={22} style={{ color: item.color }} />
                  </div>
                  <span className="text-xs text-white/70 font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div className="glass-card rounded-b-none border-b-0 px-2 pt-2 bottom-nav-safe">
          <div className="flex items-center justify-around">
            {mainTabs.map(tab => {
              const active = tab.isMore ? isMoreActive : isActive(tab.path);
              return (
                <button
                  key={tab.label}
                  onClick={() => tab.isMore ? setShowMore(!showMore) : navigate(tab.path)}
                  className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
                    active ? 'text-white' : 'text-white/40'
                  }`}
                >
                  <div className={`relative ${tab.center ? 'p-2.5' : 'p-1.5'} rounded-xl transition-all ${
                    active ? 'bg-gradient-to-br from-indigo-500/20 to-violet-500/20' : ''
                  } ${tab.center ? 'bg-gradient-to-br from-indigo-500/10 to-violet-500/10 -mt-4 shadow-lg shadow-indigo-500/10' : ''}`}>
                    <tab.icon size={tab.center ? 26 : 22} />
                    {active && (
                      <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400" />
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${active ? 'text-white' : 'text-white/40'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
