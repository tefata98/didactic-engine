import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Moon, Dumbbell, Brain, DollarSign, TrendingUp, TrendingDown, Mic, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useApp } from '../context/AppContext';
import GlassCard from '../components/GlassCard';
import ProgressRing from '../components/ProgressRing';
import AnimatedNumber from '../components/AnimatedNumber';
import Sparkline from '../components/Sparkline';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import useLocalStorage from '../hooks/useLocalStorage';
import { formatDate, getDateKey, getWeekDates, getMonthKey } from '../utils/dateHelpers';
import { COLORS, NAMESPACES, DAYS_SHORT } from '../utils/constants';

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

  const [plannerTasks] = useLocalStorage('lifeos_planner', 'tasks', {});
  const [sleepData] = useLocalStorage(NAMESPACES.sleep, null, { entries: [] });
  const [financeData] = useLocalStorage(NAMESPACES.finance, null, { income: {}, expenses: [] });
  const [readingData] = useLocalStorage(NAMESPACES.reading, null, { books: [], readingLog: [] });
  const [fitnessData] = useLocalStorage(NAMESPACES.fitness, null, { workoutLogs: {} });
  const [vocalsLog] = useLocalStorage('lifeos_vocals', 'practiceLog', []);

  const todayKey = getDateKey();
  const todayTasks = plannerTasks[todayKey] || [];
  const weekDates = getWeekDates(new Date());
  const currentMonth = getMonthKey();

  // Compute weekly activity data (% tasks completed per day)
  const weeklyData = useMemo(() => {
    return weekDates.map((d, i) => {
      const key = getDateKey(d);
      const dayTasks = plannerTasks[key] || [];
      const done = dayTasks.filter(t => t.done).length;
      const pct = dayTasks.length > 0 ? Math.round((done / dayTasks.length) * 100) : 0;
      return { day: DAYS_SHORT[i], value: pct };
    });
  }, [plannerTasks, weekDates]);

  // Compute stat cards from real data
  const statCards = useMemo(() => {
    const entries = sleepData?.entries || [];
    const lastSleep = entries.length > 0 ? entries[entries.length - 1] : null;
    const sleepScore = lastSleep ? Math.min(100, Math.round((lastSleep.duration / 8) * 100)) : 0;
    const sleepHistory = entries.slice(-7).map(e => Math.round((e.duration / 8) * 100));

    const logs = fitnessData?.workoutLogs || {};
    const weekWorkouts = weekDates.filter(d => logs[getDateKey(d)]).length;
    const workoutHistory = weekDates.map(d => logs[getDateKey(d)] ? 100 : 0);

    const weekVocals = weekDates.filter(d => {
      const dk = getDateKey(d);
      return vocalsLog.some(s => s.date === dk);
    }).length;
    const vocalsHistory = weekDates.map(d => {
      const dk = getDateKey(d);
      const daySessions = vocalsLog.filter(s => s.date === dk);
      return daySessions.length > 0 ? Math.round(daySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60) : 0;
    });

    const monthExpenses = (financeData?.expenses || []).filter(e => e.month === currentMonth);
    const totalExpenses = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const monthIncome = (financeData?.income || {})[currentMonth] || 0;
    const savingsRate = monthIncome > 0 ? Math.round(((monthIncome - totalExpenses) / monthIncome) * 100) : 0;

    return [
      { label: 'Sleep Score', value: sleepScore, suffix: '%', icon: Moon, color: COLORS.sleep, trend: 0, data: sleepHistory.length > 0 ? sleepHistory : [0] },
      { label: 'Workouts', value: weekWorkouts, suffix: '/wk', icon: Dumbbell, color: COLORS.fitness, trend: 0, data: workoutHistory },
      { label: 'Vocal Mins', value: vocalsHistory.reduce((a, b) => a + b, 0), suffix: 'm', icon: Brain, color: COLORS.vocals, trend: 0, data: vocalsHistory.length > 0 ? vocalsHistory : [0] },
      { label: 'Savings Rate', value: Math.max(0, savingsRate), suffix: '%', icon: DollarSign, color: COLORS.finance, trend: 0, data: [Math.max(0, savingsRate)] },
    ];
  }, [sleepData, fitnessData, vocalsLog, financeData, weekDates, currentMonth]);

  // Compute weekly goals
  const weeklyGoals = useMemo(() => {
    const logs = fitnessData?.workoutLogs || {};
    const workouts = weekDates.filter(d => logs[getDateKey(d)]).length;

    const weekLog = (readingData?.readingLog || []).filter(l => {
      return weekDates.some(d => getDateKey(d) === l.date);
    });
    const pagesRead = weekLog.reduce((s, l) => s + (l.pages || 0), 0);

    const vocalSessions = weekDates.filter(d => {
      const dk = getDateKey(d);
      return vocalsLog.some(s => s.date === dk);
    }).length;

    const sleepEntries = (sleepData?.entries || []).filter(e => {
      return weekDates.some(d => getDateKey(d) === e.date);
    });
    const goodSleepNights = sleepEntries.filter(e => e.duration >= 7).length;

    return [
      { label: 'Resistance Band Sessions', current: workouts, target: 3, color: COLORS.fitness },
      { label: 'Pages Read', current: pagesRead, target: 100, color: COLORS.reading },
      { label: 'Vocal Practice', current: vocalSessions, target: 5, color: COLORS.vocals },
      { label: 'Sleep 7+ Hours', current: goodSleepNights, target: 7, color: COLORS.sleep },
    ];
  }, [fitnessData, readingData, vocalsLog, sleepData, weekDates]);

  // Overall weekly progress
  const overallProgress = useMemo(() => {
    const totalGoals = weeklyGoals.reduce((s, g) => s + g.target, 0);
    const totalCurrent = weeklyGoals.reduce((s, g) => s + Math.min(g.current, g.target), 0);
    return totalGoals > 0 ? Math.round((totalCurrent / totalGoals) * 100) : 0;
  }, [weeklyGoals]);

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
        <ProgressRing value={overallProgress} size={100} strokeWidth={8} label={`${overallProgress}%`} sublabel="Weekly" />
        <div>
          <h3 className="font-heading font-semibold text-white mb-1">Overall Progress</h3>
          <p className="text-sm text-white/50">
            {overallProgress === 0 ? 'Start tracking to see your progress!' :
             overallProgress >= 70 ? "You're on track this week. Keep it up!" :
             'Keep going, you can do it!'}
          </p>
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
        {weeklyData.some(d => d.value > 0) ? (
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
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-white/30">Add tasks in Planner to see your weekly activity</p>
          </div>
        )}
      </GlassCard>

      {/* Today's Plan */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-white">Today's Plan</h3>
          <button onClick={() => navigate('/planner')} className="text-xs text-indigo-400 hover:text-indigo-300">View All</button>
        </div>
        {todayTasks.length > 0 ? (
          <div className="space-y-3">
            {todayTasks.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-12 flex-shrink-0">{item.time}</span>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[item.category] || COLORS.primary }} />
                <span className={`text-sm ${item.done ? 'text-white/40 line-through' : 'text-white/80'}`}>{item.title}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-sm text-white/30">No tasks planned for today</p>
            <button onClick={() => navigate('/planner')} className="text-xs text-indigo-400 mt-2">Add tasks</button>
          </div>
        )}
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
