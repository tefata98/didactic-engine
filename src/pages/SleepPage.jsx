import { useState, useMemo } from 'react';
import {
  Moon, Sun, Star, Clock, ChevronRight, Check, AlertCircle,
  TrendingUp, TrendingDown, Coffee, Smartphone, Wind, Thermometer,
  Brain, Lightbulb, RefreshCw, BedDouble, Sunrise
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, CartesianGrid
} from 'recharts';
import GlassCard from '../components/GlassCard';
import PageHeader from '../components/PageHeader';
import ProgressRing from '../components/ProgressRing';
import ProgressBar from '../components/ProgressBar';
import Badge from '../components/Badge';
import AnimatedNumber from '../components/AnimatedNumber';
import Sparkline from '../components/Sparkline';
import useLocalStorage from '../hooks/useLocalStorage';
import { NAMESPACES, COLORS, DAYS_SHORT } from '../utils/constants';
import { getDateKey, formatDate, getDayName } from '../utils/dateHelpers';

const ACCENT = '#818cf8';

const DEFAULT_DATA = {
  entries: [],
  targetBedtime: '23:00',
  windDownChecklist: {
    screensOff: false,
    brainDump: false,
    roomCool: false,
    noCaffeine: false,
  },
};

const SLEEP_TIPS = [
  {
    id: 1,
    title: 'Keep a Consistent Schedule',
    description: 'Go to bed and wake up at the same time every day, even on weekends. This reinforces your circadian rhythm and improves sleep quality over time.',
    icon: Clock,
    source: 'Matthew Walker, Why We Sleep',
  },
  {
    id: 2,
    title: 'Cool Your Bedroom',
    description: 'Your body needs to drop its core temperature by about 1 degree Celsius to initiate sleep. Keep your room at 18-19°C (65-67°F) for optimal sleep onset.',
    icon: Thermometer,
    source: 'Sleep Foundation Research',
  },
  {
    id: 3,
    title: 'No Screens 60 Minutes Before Bed',
    description: 'Blue light from screens suppresses melatonin production by up to 50%. Use night mode or blue-light glasses if you must use devices in the evening.',
    icon: Smartphone,
    source: 'Harvard Medical School',
  },
  {
    id: 4,
    title: 'Caffeine Has a 6-Hour Half-Life',
    description: 'A coffee at 2 PM means 50% of the caffeine is still in your system at 8 PM. Set a hard cutoff at noon or 1 PM for better sleep quality.',
    icon: Coffee,
    source: 'Journal of Clinical Sleep Medicine',
  },
  {
    id: 5,
    title: 'Practice a Brain Dump',
    description: 'Write down tomorrow\'s tasks, worries, and thoughts before bed. Studies show this reduces sleep onset latency by an average of 9 minutes.',
    icon: Brain,
    source: 'Baylor University Study, 2018',
  },
  {
    id: 6,
    title: 'Resistance Training Improves Sleep',
    description: 'Regular resistance training (like your band workouts) has been shown to improve sleep quality, reduce sleep onset time, and increase deep sleep stages.',
    icon: TrendingUp,
    source: 'British Journal of Sports Medicine, 2022',
  },
  {
    id: 7,
    title: 'Use the 4-7-8 Breathing Technique',
    description: 'Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. This activates the parasympathetic nervous system and prepares your body for sleep.',
    icon: Wind,
    source: 'Dr. Andrew Weil',
  },
  {
    id: 8,
    title: 'Sunlight Within 30 Minutes of Waking',
    description: 'Exposure to morning sunlight helps regulate your circadian rhythm and makes it easier to fall asleep at night. Aim for 10-15 minutes outdoors.',
    icon: Sunrise,
    source: 'Dr. Andrew Huberman, Stanford',
  },
];

function StarRating({ value, onChange, size = 24 }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => onChange?.(star)}
          className="transition-transform hover:scale-110 active:scale-95"
          type="button"
        >
          <Star
            size={size}
            className={star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-white/20 hover:text-white/40'}
          />
        </button>
      ))}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-sm px-3 py-2 text-xs">
      <p className="text-white/50">{label}</p>
      <p className="text-white font-medium">{payload[0].value.toFixed(1)}h</p>
    </div>
  );
}

export default function SleepPage() {
  const [data, setData] = useLocalStorage(NAMESPACES.sleep, null, DEFAULT_DATA);
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState(0);
  const [activeTipIndex, setActiveTipIndex] = useState(0);

  const entries = data.entries || [];
  const targetBedtime = data.targetBedtime || '23:00';
  const windDown = data.windDownChecklist || { screensOff: false, brainDump: false, roomCool: false, noCaffeine: false };

  const todayKey = getDateKey();
  const todayEntry = useMemo(() => entries.find(e => e.date === todayKey), [entries, todayKey]);

  function calculateDuration(bed, wake) {
    const [bh, bm] = bed.split(':').map(Number);
    const [wh, wm] = wake.split(':').map(Number);
    let bedMinutes = bh * 60 + bm;
    let wakeMinutes = wh * 60 + wm;
    if (wakeMinutes <= bedMinutes) wakeMinutes += 1440;
    return (wakeMinutes - bedMinutes) / 60;
  }

  function calculateSleepScore(entry) {
    if (!entry) return 0;
    const duration = entry.duration;
    let durationScore;
    if (duration >= 7 && duration <= 8) {
      durationScore = 100;
    } else if (duration >= 6 && duration < 7) {
      durationScore = 60 + ((duration - 6) * 40);
    } else if (duration > 8 && duration <= 9) {
      durationScore = 100 - ((duration - 8) * 20);
    } else if (duration < 6) {
      durationScore = Math.max(0, duration * 10);
    } else {
      durationScore = Math.max(0, 100 - ((duration - 9) * 30));
    }

    const [targetH, targetM] = targetBedtime.split(':').map(Number);
    const [bedH, bedM] = entry.bedtime.split(':').map(Number);
    let targetMinutes = targetH * 60 + targetM;
    let bedMinutes = bedH * 60 + bedM;
    if (targetMinutes < 720) targetMinutes += 1440;
    if (bedMinutes < 720) bedMinutes += 1440;
    const diffMinutes = Math.abs(targetMinutes - bedMinutes);
    const consistencyScore = Math.max(0, 100 - diffMinutes * 2);

    const qualityScore = (entry.quality / 5) * 100;

    return Math.round(durationScore * 0.4 + consistencyScore * 0.3 + qualityScore * 0.3);
  }

  const sleepScore = useMemo(() => {
    if (todayEntry) return calculateSleepScore(todayEntry);
    if (entries.length > 0) return calculateSleepScore(entries[entries.length - 1]);
    return 0;
  }, [todayEntry, entries, targetBedtime]);

  const weeklyChartData = useMemo(() => {
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateKey = getDateKey(date);
      const dayName = getDayName(date, true);
      const entry = entries.find(e => e.date === dateKey);
      last7.push({
        day: dayName,
        hours: entry ? entry.duration : 0,
        quality: entry ? entry.quality : 0,
      });
    }
    return last7;
  }, [entries]);

  const bedtimeConsistency = useMemo(() => {
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateKey = getDateKey(date);
      const dayName = getDayName(date, true);
      const entry = entries.find(e => e.date === dateKey);
      if (entry) {
        const [bh, bm] = entry.bedtime.split(':').map(Number);
        let bedMinutes = bh * 60 + bm;
        if (bedMinutes < 720) bedMinutes += 1440;
        const [th, tm] = targetBedtime.split(':').map(Number);
        let targetMin = th * 60 + tm;
        if (targetMin < 720) targetMin += 1440;
        const diff = bedMinutes - targetMin;
        last7.push({ day: dayName, bedtime: entry.bedtime, diffMinutes: diff });
      } else {
        last7.push({ day: dayName, bedtime: null, diffMinutes: null });
      }
    }
    return last7;
  }, [entries, targetBedtime]);

  const trends = useMemo(() => {
    if (entries.length === 0) return { avg30: 0, best: null, worst: null, weekdayAvg: 0, weekendAvg: 0 };

    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const last30 = sorted.slice(-30);
    const avg30 = last30.reduce((s, e) => s + e.duration, 0) / last30.length;

    const best = last30.reduce((best, e) => (!best || e.duration > best.duration) ? e : best, null);
    const worst = last30.reduce((worst, e) => (!worst || e.duration < worst.duration) ? e : worst, null);

    const weekdays = last30.filter(e => {
      const d = new Date(e.date);
      const day = d.getDay();
      return day !== 0 && day !== 6;
    });
    const weekends = last30.filter(e => {
      const d = new Date(e.date);
      const day = d.getDay();
      return day === 0 || day === 6;
    });

    const weekdayAvg = weekdays.length > 0 ? weekdays.reduce((s, e) => s + e.duration, 0) / weekdays.length : 0;
    const weekendAvg = weekends.length > 0 ? weekends.reduce((s, e) => s + e.duration, 0) / weekends.length : 0;

    return { avg30, best, worst, weekdayAvg, weekendAvg };
  }, [entries]);

  function handleLogSleep(e) {
    e.preventDefault();
    if (quality === 0) return;
    const duration = calculateDuration(bedtime, wakeTime);
    const newEntry = {
      date: todayKey,
      bedtime,
      wakeTime,
      quality,
      duration: Math.round(duration * 10) / 10,
      windDown: { ...windDown },
    };
    setData(prev => {
      const existingIdx = prev.entries.findIndex(e => e.date === todayKey);
      let newEntries;
      if (existingIdx >= 0) {
        newEntries = [...prev.entries];
        newEntries[existingIdx] = newEntry;
      } else {
        newEntries = [...prev.entries, newEntry];
      }
      return { ...prev, entries: newEntries };
    });
  }

  function toggleWindDown(key) {
    setData(prev => ({
      ...prev,
      windDownChecklist: {
        ...prev.windDownChecklist,
        [key]: !prev.windDownChecklist[key],
      },
    }));
  }

  function rotateTip() {
    setActiveTipIndex(prev => (prev + 1) % SLEEP_TIPS.length);
  }

  const windDownItems = [
    { key: 'screensOff', label: 'Screens off', icon: Smartphone },
    { key: 'brainDump', label: 'Brain dump done', icon: Brain },
    { key: 'roomCool', label: 'Room cool (18-19°C)', icon: Thermometer },
    { key: 'noCaffeine', label: 'No caffeine after 2 PM', icon: Coffee },
  ];

  const windDownCount = Object.values(windDown).filter(Boolean).length;
  const activeTip = SLEEP_TIPS[activeTipIndex];

  return (
    <div className="space-y-6 pb-4">
      <PageHeader
        title="Sleep"
        subtitle={formatDate()}
        rightElement={
          <div className="flex items-center gap-2">
            <Moon size={18} style={{ color: ACCENT }} />
            <span className="text-sm text-white/50">Target: {targetBedtime}</span>
          </div>
        }
      />

      {/* Sleep Score */}
      <GlassCard className="flex items-center gap-6">
        <ProgressRing
          value={sleepScore}
          size={120}
          strokeWidth={10}
          color={ACCENT}
          label={`${sleepScore}`}
          sublabel="Sleep Score"
        />
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-white mb-1">
            {sleepScore >= 80 ? 'Great Sleep' : sleepScore >= 60 ? 'Fair Sleep' : 'Needs Improvement'}
          </h3>
          <p className="text-sm text-white/50 mb-3">
            {sleepScore >= 80
              ? 'You\'re sleeping well. Keep up the routine!'
              : sleepScore >= 60
                ? 'Room for improvement. Check your wind-down habits.'
                : 'Focus on consistency and duration for better rest.'
            }
          </p>
          <div className="flex gap-3">
            <div className="text-center">
              <p className="text-xs text-white/40">Duration</p>
              <p className="text-sm font-medium text-white">{todayEntry?.duration.toFixed(1) || entries[entries.length - 1]?.duration.toFixed(1) || '0'}h</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-xs text-white/40">Quality</p>
              <div className="flex gap-0.5 mt-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    size={10}
                    className={s <= (todayEntry?.quality || entries[entries.length - 1]?.quality || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}
                  />
                ))}
              </div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-xs text-white/40">Bedtime</p>
              <p className="text-sm font-medium text-white">{todayEntry?.bedtime || entries[entries.length - 1]?.bedtime || '--:--'}</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Sleep Logger */}
      <GlassCard>
        <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
          <BedDouble size={18} style={{ color: ACCENT }} />
          Log Tonight's Sleep
        </h3>
        <form onSubmit={handleLogSleep} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/50 mb-1.5 flex items-center gap-1.5">
                <Moon size={14} />
                Bedtime
              </label>
              <input
                type="time"
                value={bedtime}
                onChange={e => setBedtime(e.target.value)}
                className="glass-input text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-white/50 mb-1.5 flex items-center gap-1.5">
                <Sun size={14} />
                Wake Time
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={e => setWakeTime(e.target.value)}
                className="glass-input text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-white/50 mb-2 block">Sleep Quality</label>
            <StarRating value={quality} onChange={setQuality} size={28} />
          </div>
          {bedtime && wakeTime && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: `${ACCENT}10` }}>
              <Clock size={14} style={{ color: ACCENT }} />
              <span className="text-sm text-white/70">
                Duration: {calculateDuration(bedtime, wakeTime).toFixed(1)} hours
              </span>
            </div>
          )}
          <button
            type="submit"
            className="btn-primary w-full text-sm"
            disabled={quality === 0}
          >
            {todayEntry ? 'Update Sleep Log' : 'Log Sleep'}
          </button>
        </form>
      </GlassCard>

      {/* Weekly Sleep Chart */}
      <GlassCard>
        <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={18} style={{ color: ACCENT }} />
          Weekly Sleep
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyChartData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
            />
            <YAxis
              domain={[0, 10]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
              width={30}
              tickFormatter={v => `${v}h`}
            />
            <Tooltip content={<ChartTooltip />} cursor={false} />
            <ReferenceLine
              y={7}
              stroke="#22c55e"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{ value: '7h', position: 'right', fill: '#22c55e', fontSize: 10 }}
            />
            <ReferenceLine
              y={8}
              stroke="#22c55e"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{ value: '8h', position: 'right', fill: '#22c55e', fontSize: 10 }}
            />
            <Bar
              dataKey="hours"
              radius={[6, 6, 0, 0]}
              fill={ACCENT}
            >
            </Bar>
            <defs>
              <linearGradient id="sleepBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT} />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: ACCENT }} />
            <span className="text-xs text-white/40">Hours slept</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-green-500" style={{ borderTop: '2px dashed #22c55e' }} />
            <span className="text-xs text-white/40">7-8h goal</span>
          </div>
        </div>
      </GlassCard>

      {/* Bedtime Consistency */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-white flex items-center gap-2">
            <Clock size={18} style={{ color: ACCENT }} />
            Bedtime Consistency
          </h3>
          <Badge color={ACCENT} variant="outlined">Target: {targetBedtime}</Badge>
        </div>
        <div className="space-y-2">
          {bedtimeConsistency.map((item, i) => {
            const isOnTarget = item.diffMinutes !== null && Math.abs(item.diffMinutes) <= 15;
            const isClose = item.diffMinutes !== null && Math.abs(item.diffMinutes) <= 30;
            const barColor = item.diffMinutes === null ? 'rgba(255,255,255,0.06)' : isOnTarget ? '#22c55e' : isClose ? '#f59e0b' : '#ef4444';
            const maxDiff = 120;
            const barWidth = item.diffMinutes !== null ? Math.min(Math.abs(item.diffMinutes) / maxDiff * 100, 100) : 0;
            const direction = item.diffMinutes !== null ? (item.diffMinutes > 0 ? 'late' : 'early') : '';

            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-8">{item.day}</span>
                <div className="flex-1 h-6 rounded-lg overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="absolute left-1/2 top-0 w-px h-full bg-white/10" />
                  {item.diffMinutes !== null && (
                    <div
                      className="absolute top-1 h-4 rounded-full transition-all duration-500"
                      style={{
                        background: barColor,
                        width: `${Math.max(barWidth / 2, 2)}%`,
                        left: item.diffMinutes >= 0 ? '50%' : `${50 - barWidth / 2}%`,
                        opacity: 0.7,
                      }}
                    />
                  )}
                </div>
                <span className="text-xs text-white/50 w-14 text-right">
                  {item.bedtime || '--:--'}
                </span>
                {item.diffMinutes !== null && (
                  <span className={`text-xs w-12 text-right ${isOnTarget ? 'text-green-400' : isClose ? 'text-yellow-400' : 'text-red-400'}`}>
                    {isOnTarget ? 'On time' : `${Math.abs(item.diffMinutes)}m ${direction}`}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Wind-Down Checklist */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-white flex items-center gap-2">
            <Moon size={18} style={{ color: ACCENT }} />
            Wind-Down Checklist
          </h3>
          <span className="text-xs text-white/40">{windDownCount}/4 done</span>
        </div>
        <div className="space-y-2">
          {windDownItems.map(item => {
            const checked = windDown[item.key];
            return (
              <button
                key={item.key}
                onClick={() => toggleWindDown(item.key)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  checked ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                    checked ? 'bg-gradient-to-br from-indigo-500 to-violet-500' : 'border border-white/20'
                  }`}
                >
                  {checked && <Check size={14} className="text-white" />}
                </div>
                <item.icon size={16} className={checked ? 'text-white/70' : 'text-white/30'} />
                <span className={`text-sm ${checked ? 'text-white/80 line-through' : 'text-white/60'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        <ProgressBar value={windDownCount} max={4} color={ACCENT} height={4} className="mt-4" />
      </GlassCard>

      {/* Trends */}
      <GlassCard>
        <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={18} style={{ color: ACCENT }} />
          Sleep Trends
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs text-white/40 mb-1">30-Day Average</p>
            <p className="text-xl font-heading font-bold text-white">{trends.avg30.toFixed(1)}h</p>
            <Sparkline
              data={entries.slice(-14).map(e => e.duration)}
              color={ACCENT}
              width={100}
              height={24}
            />
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs text-white/40 mb-1">Weekday vs Weekend</p>
            <div className="flex items-end gap-2 mt-1">
              <div className="text-center">
                <div className="w-8 rounded-t" style={{ height: `${trends.weekdayAvg * 8}px`, background: ACCENT }} />
                <p className="text-xs text-white/40 mt-1">WD</p>
                <p className="text-xs text-white/60">{trends.weekdayAvg.toFixed(1)}h</p>
              </div>
              <div className="text-center">
                <div className="w-8 rounded-t" style={{ height: `${trends.weekendAvg * 8}px`, background: '#a78bfa' }} />
                <p className="text-xs text-white/40 mt-1">WE</p>
                <p className="text-xs text-white/60">{trends.weekendAvg.toFixed(1)}h</p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs text-white/40 mb-1">Best Night</p>
            {trends.best ? (
              <>
                <p className="text-lg font-heading font-bold text-green-400">{trends.best.duration.toFixed(1)}h</p>
                <p className="text-xs text-white/40">{trends.best.date}</p>
              </>
            ) : (
              <p className="text-sm text-white/30">No data</p>
            )}
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs text-white/40 mb-1">Worst Night</p>
            {trends.worst ? (
              <>
                <p className="text-lg font-heading font-bold text-red-400">{trends.worst.duration.toFixed(1)}h</p>
                <p className="text-xs text-white/40">{trends.worst.date}</p>
              </>
            ) : (
              <p className="text-sm text-white/30">No data</p>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Sleep Tips */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-white flex items-center gap-2">
            <Lightbulb size={18} style={{ color: '#f59e0b' }} />
            Sleep Tips
          </h3>
          <button
            onClick={rotateTip}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Next tip"
          >
            <RefreshCw size={16} className="text-white/40" />
          </button>
        </div>
        <div className="p-4 rounded-xl" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}15` }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${ACCENT}20` }}>
              <activeTip.icon size={20} style={{ color: ACCENT }} />
            </div>
            <div>
              <h4 className="font-medium text-white text-sm mb-1">{activeTip.title}</h4>
              <p className="text-xs text-white/60 leading-relaxed mb-2">{activeTip.description}</p>
              <p className="text-xs text-white/30 italic">{activeTip.source}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-1.5 mt-3">
          {SLEEP_TIPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveTipIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === activeTipIndex ? 'w-4' : ''
              }`}
              style={{ background: i === activeTipIndex ? ACCENT : 'rgba(255,255,255,0.15)' }}
            />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
