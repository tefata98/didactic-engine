import { useNavigate } from 'react-router-dom';
import { Bell, Moon, Footprints, Brain, DollarSign, TrendingUp, TrendingDown, Dumbbell, Mic, BookOpen, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useApp } from '../context/AppContext';
import GlassCard from '../components/GlassCard';
import ProgressRing from '../components/ProgressRing';
import AnimatedNumber from '../components/AnimatedNumber';
import Sparkline from '../components/Sparkline';
import ProgressBar from '../components/ProgressBar';
import { formatDate } from '../utils/dateHelpers';
import { COLORS } from '../utils/constants';

const weeklyData = [
  { day: 'Mon', value: 75 },
  { day: 'Tue', value: 60 },
  { day: 'Wed', value: 85 },
  { day: 'Thu', value: 70 },
  { day: 'Fri', value: 90 },
  { day: 'Sat', value: 45 },
  { day: 'Sun', value: 55 },
];

const statCards = [
  { label: 'Sleep Score', value: 82, suffix: '%', icon: Moon, color: COLORS.sleep, trend: 5, data: [65, 70, 72, 68, 75, 80, 82] },
  { label: 'Steps Today', value: 8432, icon: Footprints, color: COLORS.fitness, trend: 12, data: [6000, 7200, 5800, 8400, 7600, 9100, 8432] },
  { label: 'Focus Hours', value: 6.5, suffix: 'h', icon: Brain, color: COLORS.work, trend: -3, data: [5, 7, 6, 5.5, 7, 6, 6.5] },
  { label: 'Savings Rate', value: 28, suffix: '%', icon: DollarSign, color: COLORS.finance, trend: 8, data: [20, 22, 24, 23, 25, 27, 28] },
];

const weeklyGoals = [
  { label: 'Resistance Band Sessions', current: 2, target: 3, color: COLORS.fitness },
  { label: 'Pages Read', current: 45, target: 100, color: COLORS.reading },
  { label: 'Vocal Practice', current: 4, target: 5, color: COLORS.vocals },
  { label: 'Budget Review', current: 1, target: 1, color: COLORS.finance },
  { label: 'Sleep 7+ Hours', current: 5, target: 7, color: COLORS.sleep },
];

const todaysPlan = [
  { time: '07:00', task: 'Upper Push Workout (Day A)', category: 'fitness' },
  { time: '18:00', task: 'SLS Vocal Warm-Up', category: 'vocals' },
  { time: '21:00', task: 'Read 20 pages', category: 'reading' },
];

const quickActions = [
  { icon: Dumbbell, label: 'Workout', path: '/fitness', color: COLORS.fitness },
  { icon: Mic, label: 'Vocals', path: '/vocals', color: COLORS.vocals },
  { icon: DollarSign, label: 'Expense', path: '/finance', color: COLORS.finance },
  { icon: BookOpen, label: 'Book', path: '/reading', color: COLORS.reading },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-sm px-3 py-2 text-xs">
      <p className="text-white/50">{label}</p>
      <p className="text-white font-medium">{payload[0].value}%</p>
    </div>
  );
}

export default function DashboardPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const unreadCount = state.notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">
            {getGreeting()}, {state.user.name}
          </h1>
          <p className="text-sm text-white/50 mt-1">{formatDate()}</p>
        </div>
        <button className="relative w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <Bell size={20} className="text-white/70" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Weekly Progress Ring */}
      <GlassCard className="flex items-center gap-6">
        <ProgressRing value={68} size={100} strokeWidth={8} label="68%" sublabel="Weekly" />
        <div>
          <h3 className="font-heading font-semibold text-white mb-1">Overall Progress</h3>
          <p className="text-sm text-white/50">You're on track this week. Keep it up!</p>
        </div>
      </GlassCard>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map(card => (
          <GlassCard key={card.label} padding="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${card.color}20` }}>
                <card.icon size={18} style={{ color: card.color }} />
              </div>
              <div className={`flex items-center gap-0.5 text-xs font-medium ${card.trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {card.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(card.trend)}%
              </div>
            </div>
            <div className="text-xl font-heading font-bold text-white mb-0.5">
              <AnimatedNumber value={Math.floor(card.value)} suffix={card.suffix || ''} />
            </div>
            <p className="text-xs text-white/40 mb-3">{card.label}</p>
            <Sparkline data={card.data} color={card.color} width={120} height={28} />
          </GlassCard>
        ))}
      </div>

      {/* Weekly Activity Chart */}
      <GlassCard>
        <h3 className="font-heading font-semibold text-white mb-4">Weekly Activity</h3>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={weeklyData}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
            <Tooltip content={<ChartTooltip />} cursor={false} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="url(#barGradient)" />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Today's Plan */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-white">Today's Plan</h3>
          <button onClick={() => navigate('/planner')} className="text-xs text-indigo-400 hover:text-indigo-300">View All</button>
        </div>
        <div className="space-y-3">
          {todaysPlan.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-white/40 w-12 flex-shrink-0">{item.time}</span>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[item.category] }} />
              <span className="text-sm text-white/80">{item.task}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Weekly Goals */}
      <GlassCard>
        <h3 className="font-heading font-semibold text-white mb-4">This Week's Goals</h3>
        <div className="space-y-4">
          {weeklyGoals.map(goal => (
            <div key={goal.label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-white/70">{goal.label}</span>
                <span className="text-white/50">{goal.current}/{goal.target}</span>
              </div>
              <ProgressBar value={goal.current} max={goal.target} color={goal.color} height={6} />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Quick Actions */}
      <div>
        <h3 className="font-heading font-semibold text-white mb-3">Quick Actions</h3>
        <div className="flex gap-3">
          {quickActions.map(action => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 flex-1 active:scale-95 transition-transform"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${action.color}15` }}>
                <action.icon size={24} style={{ color: action.color }} />
              </div>
              <span className="text-xs text-white/60">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
