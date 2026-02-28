import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Mic, Play, Pause, RotateCcw, Clock, Flame, Target, ChevronDown, ChevronUp,
  Music, Wind, BookOpen, ListMusic, Star, Plus, X, Check, AlertTriangle, Music2, Volume2,
  Heart, Droplets, Ban, Stethoscope, Moon as MoonIcon, Thermometer, ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import GlassCard from '../components/GlassCard';
import TabBar from '../components/TabBar';
import ProgressRing from '../components/ProgressRing';
import ProgressBar from '../components/ProgressBar';
import Badge from '../components/Badge';
import AnimatedNumber from '../components/AnimatedNumber';
import EmptyState from '../components/EmptyState';
import useTimer from '../hooks/useTimer';
import useLocalStorage from '../hooks/useLocalStorage';
import { warmUpRoutines, slsExerciseCategories, breathingExercises, theoryLessons, sethRiggsBio, vocalHealthTips, dailyRoutines } from '../modules/vocals/vocalsData';
import { getDateKey } from '../utils/dateHelpers';
import { NAMESPACES, DAYS_SHORT } from '../utils/constants';

const tabs = [
  { id: 'overview', label: 'Overview', icon: Mic },
  { id: 'warmups', label: 'Warm-Ups', icon: Music },
  { id: 'exercises', label: 'SLS Exercises', icon: Target },
  { id: 'breathing', label: 'Breathing', icon: Wind },
  { id: 'theory', label: 'Theory', icon: BookOpen },
  { id: 'setlist', label: 'Setlist', icon: ListMusic },
];

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-sm px-3 py-2 text-xs">
      <p className="text-white/50">{label}</p>
      <p className="text-white font-medium">{payload[0].value} min</p>
    </div>
  );
}

/* ========== OVERVIEW TAB ========== */
function OverviewTab() {
  const timer = useTimer(0);
  const goalSeconds = 25 * 60;
  const progress = Math.min((timer.time / goalSeconds) * 100, 100);
  const [practiceLog, setPracticeLog] = useLocalStorage('lifeos_vocals', 'practiceLog', []);
  const wasRunningRef = useRef(false);

  // Auto-log practice session when timer is paused after running for > 60 seconds
  useEffect(() => {
    if (wasRunningRef.current && !timer.isRunning && timer.time > 60) {
      const todayKey = getDateKey();
      // Check if we already logged for this exact duration to avoid duplicates
      setPracticeLog(prev => [
        ...prev,
        { id: Date.now().toString(), date: todayKey, duration: timer.time, type: 'practice' }
      ]);
    }
    wasRunningRef.current = timer.isRunning;
  }, [timer.isRunning]);

  // Compute stats from practiceLog
  const stats = useMemo(() => {
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    const thisWeekSessions = practiceLog.filter(s => {
      const d = new Date(s.date);
      return d >= weekStart;
    });
    const thisWeekDays = new Set(thisWeekSessions.map(s => s.date)).size;

    const totalSessions = practiceLog.length;

    const avgMin = totalSessions > 0
      ? Math.round(practiceLog.reduce((sum, s) => sum + (s.duration || 0), 0) / totalSessions / 60)
      : 0;

    // Compute streak: consecutive days with practice
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const dateKey = getDateKey(new Date(today.getTime() - i * 86400000));
      const hasPractice = practiceLog.some(s => s.date === dateKey);
      if (hasPractice) {
        streak++;
      } else if (i > 0) {
        break;
      } else {
        break;
      }
    }

    return { thisWeekDays, totalSessions, avgMin, streak };
  }, [practiceLog]);

  // Compute practice chart data for last 7 days
  const practiceChartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateKey = getDateKey(date);
      const dayIdx = (date.getDay() + 6) % 7;
      const dayName = DAYS_SHORT[dayIdx];
      const daySessions = practiceLog.filter(s => s.date === dateKey);
      const totalMins = Math.round(daySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60);
      data.push({ day: dayName, mins: totalMins });
    }
    return data;
  }, [practiceLog]);

  return (
    <div className="space-y-5">
      <GlassCard className="flex flex-col items-center py-6">
        <ProgressRing value={progress} size={140} strokeWidth={10} color="#ec4899" label={timer.formatted} sublabel="/ 25:00" />
        <div className="flex gap-3 mt-5">
          {!timer.isRunning ? (
            <button onClick={timer.start} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium flex items-center gap-2 active:scale-95 transition-transform">
              <Play size={18} /> Start
            </button>
          ) : (
            <button onClick={timer.pause} className="px-6 py-2.5 rounded-xl bg-white/10 text-white font-medium flex items-center gap-2 active:scale-95 transition-transform">
              <Pause size={18} /> Pause
            </button>
          )}
          <button onClick={() => timer.reset(0)} className="px-4 py-2.5 rounded-xl bg-white/5 text-white/60 flex items-center gap-2 active:scale-95 transition-transform">
            <RotateCcw size={16} />
          </button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'This Week', value: `${stats.thisWeekDays}/5`, icon: Target },
          { label: 'Total', value: stats.totalSessions, icon: Mic },
          { label: 'Avg Min', value: stats.avgMin, icon: Clock },
          { label: 'Streak', value: stats.streak, icon: Flame },
        ].map(s => (
          <GlassCard key={s.label} padding="p-3" className="text-center">
            <s.icon size={16} className="text-pink-400 mx-auto mb-1.5" />
            <p className="text-lg font-heading font-bold text-white">
              {typeof s.value === 'number' ? <AnimatedNumber value={s.value} /> : s.value}
            </p>
            <p className="text-[10px] text-white/40 mt-0.5">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard>
        <h3 className="font-heading font-semibold text-white mb-4">Weekly Practice</h3>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={practiceChartData}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
            <Tooltip content={<ChartTip />} cursor={false} />
            <Bar dataKey="mins" radius={[4, 4, 0, 0]} fill="#ec4899" />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      <div>
        <h3 className="font-heading font-semibold text-white mb-3">Quick Start</h3>
        <div className="grid grid-cols-2 gap-3">
          {warmUpRoutines.map(r => (
            <GlassCard key={r.id} hover padding="p-4">
              <h4 className="text-sm font-semibold text-white mb-1">{r.name}</h4>
              <div className="flex gap-2 mt-2">
                <Badge color="#ec4899" size="sm">{r.duration}</Badge>
                <Badge color="#8b5cf6" variant="outlined" size="sm">{r.level}</Badge>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      <GlassCard className="border-l-4" style={{ borderLeftColor: '#ec4899' }}>
        <h4 className="text-sm font-semibold text-white mb-1">Today's Recommended</h4>
        <p className="text-sm text-white/60">Full SLS Session (25 min) — build your mix voice for weekend rehearsal</p>
      </GlassCard>

      {/* Daily Routines */}
      <div>
        <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
          <Clock size={16} className="text-pink-400" />
          Suggested Routines
        </h3>
        <div className="space-y-3">
          {dailyRoutines.map(routine => (
            <GlassCard key={routine.id} padding="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-white">{routine.name}</h4>
                  <Badge color="#ec4899" size="sm">{routine.duration}</Badge>
                </div>
                <ChevronRight size={16} className="text-white/30 mt-1" />
              </div>
              <p className="text-xs text-white/50 leading-relaxed mb-2">{routine.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {routine.exercises.map(ex => (
                  <span key={ex} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-pink-500/10 text-pink-300">
                    {ex}
                  </span>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Vocal Health Tips */}
      <div>
        <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
          <Heart size={16} className="text-rose-400" />
          Vocal Health
        </h3>
        <div className="space-y-3">
          {vocalHealthTips.map((tip, i) => {
            const iconMap = {
              droplet: Droplets,
              ban: Ban,
              alert: AlertTriangle,
              stethoscope: Stethoscope,
              moon: MoonIcon,
              flame: Flame,
              wind: Wind,
            };
            const TipIcon = iconMap[tip.icon] || Heart;
            return (
              <GlassCard key={i} padding="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <TipIcon size={16} className="text-rose-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">{tip.title}</h4>
                    <p className="text-xs text-white/50 leading-relaxed">{tip.description}</p>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ========== WARM-UPS TAB ========== */
function WarmUpsTab() {
  const [expanded, setExpanded] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});

  return (
    <div className="space-y-4">
      {warmUpRoutines.map(routine => {
        const isOpen = expanded === routine.id;
        const done = routine.steps.filter((_, i) => completedSteps[`${routine.id}-${i}`]).length;
        return (
          <GlassCard key={routine.id} padding="p-0">
            <button onClick={() => setExpanded(isOpen ? null : routine.id)} className="w-full flex items-center justify-between p-5">
              <div>
                <h3 className="text-base font-heading font-semibold text-white text-left">{routine.name}</h3>
                <div className="flex gap-2 mt-2">
                  <Badge color="#ec4899" size="sm">{routine.duration}</Badge>
                  <Badge color="#8b5cf6" variant="outlined" size="sm">{routine.level}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {done > 0 && <span className="text-xs text-white/40">{done}/{routine.steps.length}</span>}
                {isOpen ? <ChevronUp size={18} className="text-white/40" /> : <ChevronDown size={18} className="text-white/40" />}
              </div>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 space-y-3 border-t border-white/5 pt-4">
                <ProgressBar value={done} max={routine.steps.length} color="#ec4899" height={4} />
                {routine.steps.map((step, i) => {
                  const key = `${routine.id}-${i}`;
                  const checked = !!completedSteps[key];
                  return (
                    <div
                      key={i}
                      onClick={() => setCompletedSteps(p => ({ ...p, [key]: !checked }))}
                      className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all ${checked ? 'bg-pink-500/10 opacity-70' : 'bg-white/[0.03] hover:bg-white/[0.06]'}`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${checked ? 'border-pink-400 bg-pink-500/20' : 'border-white/20'}`}>
                        {checked ? <Check size={12} className="text-pink-400" /> : <span className="text-[10px] text-white/40">{i + 1}</span>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${checked ? 'text-white/50 line-through' : 'text-white'}`}>{step.name}</h4>
                          <span className="text-xs text-white/30 ml-2 flex-shrink-0">{step.duration}</span>
                        </div>
                        <p className="text-xs text-white/40 mt-1 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        );
      })}
    </div>
  );
}

/* ========== SLS EXERCISES TAB ========== */
function ExercisesTab() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-6">
      {slsExerciseCategories.map(cat => (
        <div key={cat.name}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
            <h3 className="font-heading font-semibold text-white">{cat.name}</h3>
          </div>
          <div className="space-y-3">
            {cat.exercises.map(ex => {
              const open = expanded === ex.name;
              return (
                <GlassCard key={ex.name} padding="p-0">
                  <button onClick={() => setExpanded(open ? null : ex.name)} className="w-full flex items-center justify-between p-4">
                    <h4 className="text-sm font-semibold text-white text-left">{ex.name}</h4>
                    {open ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                  </button>
                  {open && (
                    <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
                      <div>
                        <h5 className="text-xs text-white/40 uppercase tracking-wider mb-1">Purpose</h5>
                        <p className="text-sm text-white/70 leading-relaxed">{ex.purpose}</p>
                      </div>
                      <div>
                        <h5 className="text-xs text-white/40 uppercase tracking-wider mb-1">Pattern</h5>
                        <p className="text-sm text-white font-mono">{ex.pattern}</p>
                      </div>
                      <div>
                        <h5 className="text-xs text-white/40 uppercase tracking-wider mb-1">How To</h5>
                        <p className="text-sm text-white/70 leading-relaxed">{ex.howTo}</p>
                      </div>
                      {/* Seth Riggs Quote */}
                      <div className="p-4 rounded-xl" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                        <h5 className="text-xs text-violet-400 uppercase tracking-wider mb-2">Seth Riggs Says</h5>
                        <p className="text-sm text-violet-200 italic leading-relaxed">{ex.sethRiggsQuote}</p>
                      </div>
                      {/* Common Mistakes */}
                      <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle size={14} className="text-red-400" />
                          <h5 className="text-xs text-red-400 uppercase tracking-wider">Common Mistakes</h5>
                        </div>
                        <p className="text-sm text-red-300/80 leading-relaxed">{ex.commonMistakes}</p>
                      </div>
                      {/* Rock Application */}
                      <div className="p-4 rounded-xl" style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Music2 size={14} className="text-pink-400" />
                          <h5 className="text-xs text-pink-400 uppercase tracking-wider">Rock Application for Phoenix</h5>
                        </div>
                        <p className="text-sm text-pink-200/80 leading-relaxed">{ex.rockApplication}</p>
                      </div>
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ========== BREATHING TAB ========== */
function BreathingTab() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-4">
      {breathingExercises.map(ex => {
        const open = expanded === ex.name;
        return (
          <GlassCard key={ex.name} padding="p-0">
            <button onClick={() => setExpanded(open ? null : ex.name)} className="w-full flex items-center justify-between p-4">
              <div>
                <h4 className="text-sm font-semibold text-white text-left">{ex.name}</h4>
                <div className="flex gap-2 mt-1.5">
                  <Badge color="#818cf8" size="sm">{ex.duration}</Badge>
                  <Badge color="#a78bfa" variant="outlined" size="sm">{ex.level}</Badge>
                </div>
              </div>
              {open ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
            </button>
            {open && (
              <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
                <ol className="space-y-2">
                  {ex.steps.map((s, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-white/70 leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ol>
                <div className="p-4 rounded-xl" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <h5 className="text-xs text-violet-400 uppercase tracking-wider mb-2">Seth Riggs Says</h5>
                  <p className="text-sm text-violet-200 italic leading-relaxed">{ex.sethRiggsQuote}</p>
                </div>
              </div>
            )}
          </GlassCard>
        );
      })}
    </div>
  );
}

/* ========== THEORY TAB ========== */
function TheoryTab() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-4">
      <GlassCard className="border-t-2" style={{ borderTopColor: '#8b5cf6' }}>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Volume2 size={28} className="text-white" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-white">{sethRiggsBio.name}</h3>
            <p className="text-xs text-white/40 mt-0.5">{sethRiggsBio.years}</p>
            <p className="text-sm text-white/60 mt-2 leading-relaxed">{sethRiggsBio.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {sethRiggsBio.famousStudents.map(s => (
                <Badge key={s} color="#8b5cf6" size="sm">{s}</Badge>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {theoryLessons.map(lesson => {
        const open = expanded === lesson.title;
        return (
          <GlassCard key={lesson.title} padding="p-0">
            <button onClick={() => setExpanded(open ? null : lesson.title)} className="w-full flex items-center justify-between p-4">
              <h4 className="text-sm font-semibold text-white text-left flex-1 mr-2">{lesson.title}</h4>
              {open ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
            </button>
            {open && (
              <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
                <p className="text-sm text-white/70 leading-relaxed">{lesson.content}</p>
                <div>
                  <h5 className="text-xs text-white/40 uppercase tracking-wider mb-2">Key Points</h5>
                  <ul className="space-y-1.5">
                    {lesson.keyPoints.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0 mt-1.5" />
                        <span className="text-white/60">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </GlassCard>
        );
      })}
    </div>
  );
}

/* ========== SETLIST TAB ========== */
function SetlistTab() {
  const [songs, setSongs] = useLocalStorage('lifeos_vocals', 'setlist', [
    { id: '1', title: 'Rise Above', artist: 'Phoenix', key: 'E', bpm: 130, difficulty: 4, notes: 'Powerful chorus — use NAY belt technique. Bridge is E4-F#4.', status: 'performance' },
    { id: '2', title: 'Burning Skies', artist: 'Phoenix', key: 'A', bpm: 140, difficulty: 5, notes: 'Most demanding song. Rest before this one. Use controlled distortion on bridge.', status: 'rehearsing' },
    { id: '3', title: 'Midnight Echo', artist: 'Phoenix', key: 'G', bpm: 95, difficulty: 2, notes: 'Ballad — focus on breath control and MUM warmth.', status: 'performance' },
    { id: '4', title: 'Thunder Road', artist: 'Phoenix', key: 'D', bpm: 120, difficulty: 3, notes: 'Good mid-set energy. Mix voice throughout verses.', status: 'learning' },
    { id: '5', title: 'Afterglow', artist: 'Phoenix', key: 'C', bpm: 108, difficulty: 3, notes: 'Vocal harmonies needed. Practice GEE head voice parts.', status: 'rehearsing' },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [gigMode, setGigMode] = useState(false);
  const [filter, setFilter] = useState('all');

  const statusColors = { learning: '#f59e0b', rehearsing: '#6366f1', performance: '#22c55e' };
  const statusLabels = { learning: 'Learning', rehearsing: 'Rehearsing', performance: 'Ready' };
  const filtered = filter === 'all' ? songs : songs.filter(s => s.status === filter);
  const totalFatigue = songs.reduce((sum, s) => sum + s.difficulty, 0);

  const addSong = (song) => { setSongs([...songs, { ...song, id: Date.now().toString() }]); setShowAdd(false); };
  const toggleStatus = (id) => {
    const cycle = { learning: 'rehearsing', rehearsing: 'performance', performance: 'learning' };
    setSongs(songs.map(s => s.id === id ? { ...s, status: cycle[s.status] } : s));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['all', 'learning', 'rehearsing', 'performance'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${filter === f ? 'bg-pink-500/20 text-pink-300' : 'text-white/40 hover:text-white/60'}`}>
              {f === 'all' ? 'All' : statusLabels[f]}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd(true)} className="w-8 h-8 rounded-xl bg-pink-500/20 flex items-center justify-center flex-shrink-0 ml-2">
          <Plus size={16} className="text-pink-400" />
        </button>
      </div>

      <GlassCard padding="p-4" className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-white">Gig Mode</h4>
          <p className="text-xs text-white/40 mt-0.5">Ordered setlist with fatigue tracking</p>
        </div>
        <button onClick={() => setGigMode(!gigMode)} className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${gigMode ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' : 'bg-white/5 text-white/50'}`}>
          {gigMode ? 'Active' : 'Off'}
        </button>
      </GlassCard>

      {gigMode && (
        <GlassCard padding="p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/60">Set Vocal Fatigue</span>
            <span className="text-white/40">{totalFatigue}/{songs.length * 5}</span>
          </div>
          <ProgressBar value={totalFatigue} max={songs.length * 5} color={totalFatigue > songs.length * 3.5 ? '#ef4444' : '#ec4899'} />
        </GlassCard>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={Music} title="No songs yet" description="Add songs to build your Phoenix setlist" action={{ label: 'Add Song', onClick: () => setShowAdd(true) }} />
      ) : (
        <div className="space-y-3">
          {filtered.map((song, idx) => (
            <GlassCard key={song.id} padding="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {gigMode && <span className="text-lg font-heading font-bold text-white/30">{idx + 1}</span>}
                  <div>
                    <h4 className="text-sm font-semibold text-white">{song.title}</h4>
                    <p className="text-xs text-white/40">{song.artist}</p>
                  </div>
                </div>
                <button onClick={() => toggleStatus(song.id)}>
                  <Badge color={statusColors[song.status]} size="sm">{statusLabels[song.status]}</Badge>
                </button>
              </div>
              <div className="flex gap-4 text-xs text-white/40 mb-2">
                <span>Key: {song.key}</span>
                <span>BPM: {song.bpm}</span>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={10} className={i < song.difficulty ? 'text-pink-400 fill-pink-400' : 'text-white/15'} />
                  ))}
                </span>
              </div>
              {song.notes && <p className="text-xs text-white/50 leading-relaxed">{song.notes}</p>}
              {gigMode && song.difficulty >= 4 && idx < filtered.length - 1 && (
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-amber-400">
                  <AlertTriangle size={12} />
                  <span>Rest recommended after this song</span>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <AddSongForm onAdd={addSong} onClose={() => setShowAdd(false)} />
        </div>
      )}
    </div>
  );
}

function AddSongForm({ onAdd, onClose }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('Phoenix');
  const [songKey, setSongKey] = useState('C');
  const [bpm, setBpm] = useState(120);
  const [difficulty, setDifficulty] = useState(3);
  const [notes, setNotes] = useState('');
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), artist: artist.trim(), key: songKey, bpm: Number(bpm), difficulty, notes: notes.trim(), status: 'learning' });
  };

  return (
    <div className="relative glass-card w-full max-w-md p-6 mx-4 mb-4 md:mb-0 animate-slideUp" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-heading font-semibold text-white text-lg">Add Song</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><X size={16} className="text-white/70" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Song title" value={title} onChange={e => setTitle(e.target.value)} className="glass-input" autoFocus />
        <input type="text" placeholder="Artist" value={artist} onChange={e => setArtist(e.target.value)} className="glass-input" />
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-white/40 mb-1 block">Key</label>
            <select value={songKey} onChange={e => setSongKey(e.target.value)} className="glass-input text-sm">
              {keys.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">BPM</label>
            <input type="number" value={bpm} onChange={e => setBpm(e.target.value)} className="glass-input text-sm" min={40} max={240} />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Difficulty</label>
            <div className="flex gap-1 pt-2">
              {[1, 2, 3, 4, 5].map(d => (
                <button key={d} type="button" onClick={() => setDifficulty(d)}>
                  <Star size={16} className={d <= difficulty ? 'text-pink-400 fill-pink-400' : 'text-white/20'} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <textarea placeholder="Notes (vocal challenges, SLS techniques...)" value={notes} onChange={e => setNotes(e.target.value)} className="glass-input h-20 resize-none" />
        <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium active:scale-95 transition-transform">Add Song</button>
      </form>
    </div>
  );
}

/* ========== MAIN PAGE ========== */
export default function VocalsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const content = {
    overview: <OverviewTab />,
    warmups: <WarmUpsTab />,
    exercises: <ExercisesTab />,
    breathing: <BreathingTab />,
    theory: <TheoryTab />,
    setlist: <SetlistTab />,
  };

  return (
    <div className="pb-4">
      <div className="mb-5">
        <h1 className="text-2xl font-heading font-bold text-white">Vocals</h1>
        <p className="text-sm text-white/50 mt-1">SLS Training for Phoenix</p>
      </div>
      <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      {content[activeTab]}
    </div>
  );
}
