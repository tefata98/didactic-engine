import { useState, useMemo, useCallback } from 'react';
import {
  Dumbbell, Play, Pause, RotateCcw, Check, ChevronDown, ChevronUp,
  Flame, Trophy, Calendar, TrendingUp, Timer, Scale, Ruler,
  Activity, Target, Clock, Plus, Trash2, X
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import PageHeader from '../components/PageHeader';
import TabBar from '../components/TabBar';
import ProgressRing from '../components/ProgressRing';
import ProgressBar from '../components/ProgressBar';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import AnimatedNumber from '../components/AnimatedNumber';
import useLocalStorage from '../hooks/useLocalStorage';
import useTimer from '../hooks/useTimer';
import { NAMESPACES, COLORS } from '../utils/constants';
import { getDateKey, getDayOfWeek, formatDate, formatDateShort, getDayName, isSameDay } from '../utils/dateHelpers';

const ACCENT = '#a78bfa';

const WORKOUT_SCHEDULE = {
  A: {
    name: 'Upper Push',
    dayLabel: 'Day A',
    color: '#a78bfa',
    exercises: [
      {
        id: 'pushups',
        name: 'Banded Push-Ups',
        sets: 3,
        reps: '12',
        rest: 60,
        description: 'Place the band across your upper back, holding ends under your palms. Perform push-ups with controlled tempo, keeping core engaged throughout.',
      },
      {
        id: 'ohp',
        name: 'Overhead Press',
        sets: 3,
        reps: '12',
        rest: 60,
        description: 'Stand on the band, grip at shoulder width. Press overhead to full extension, keeping ribs down and core braced. Lower with control.',
      },
      {
        id: 'flyes',
        name: 'Chest Flyes',
        sets: 3,
        reps: '10',
        rest: 60,
        description: 'Anchor band behind you at chest height. With slight elbow bend, bring hands together in front of chest. Squeeze pecs at peak contraction.',
      },
      {
        id: 'tricep_ext',
        name: 'Tricep Extensions',
        sets: 3,
        reps: '12',
        rest: 60,
        description: 'Anchor band overhead. Face away, extend arms forward from behind head. Keep elbows close to ears, fully extend at the bottom.',
      },
      {
        id: 'plank_pull',
        name: 'Plank with Band Pull',
        sets: 3,
        reps: '30s',
        rest: 90,
        description: 'Hold a forearm plank with band looped around wrists. Alternate pulling one hand forward while stabilizing with the other. Maintain neutral spine.',
      },
    ],
  },
  B: {
    name: 'Lower Body',
    dayLabel: 'Day B',
    color: '#22c55e',
    exercises: [
      {
        id: 'squats',
        name: 'Banded Squats',
        sets: 3,
        reps: '15',
        rest: 60,
        description: 'Stand on the band with feet shoulder-width apart. Hold band at shoulders. Squat to parallel keeping knees tracking over toes. Drive up through heels.',
      },
      {
        id: 'rdl',
        name: 'Romanian Deadlifts',
        sets: 3,
        reps: '12',
        rest: 60,
        description: 'Stand on the band, hinge at hips with soft knees. Lower hands along shins until hamstring stretch, then squeeze glutes to return upright.',
      },
      {
        id: 'lateral_walks',
        name: 'Lateral Walks',
        sets: 3,
        reps: '20',
        rest: 60,
        description: 'Place mini band above knees. Assume quarter-squat position. Step laterally maintaining tension. 10 steps each direction per set.',
      },
      {
        id: 'glute_bridges',
        name: 'Glute Bridges',
        sets: 3,
        reps: '15',
        rest: 60,
        description: 'Lie on back with band above knees, feet flat. Drive hips up squeezing glutes at top. Push knees out against band throughout the movement.',
      },
      {
        id: 'calf_raises',
        name: 'Calf Raises',
        sets: 3,
        reps: '20',
        rest: 30,
        description: 'Stand on band with balls of feet, hold ends at sides. Rise up on toes with full range of motion. Pause at top, lower slowly.',
      },
    ],
  },
  C: {
    name: 'Upper Pull',
    dayLabel: 'Day C',
    color: '#6366f1',
    exercises: [
      {
        id: 'rows',
        name: 'Banded Rows',
        sets: 3,
        reps: '12',
        rest: 60,
        description: 'Anchor band at chest height. Pull handles to ribcage, squeezing shoulder blades together. Keep elbows close to body and chest lifted.',
      },
      {
        id: 'face_pulls',
        name: 'Face Pulls',
        sets: 3,
        reps: '15',
        rest: 60,
        description: 'Anchor band at face height. Pull to face level with elbows high, externally rotate at end position. Focus on rear delts and upper back.',
      },
      {
        id: 'bicep_curls',
        name: 'Bicep Curls',
        sets: 3,
        reps: '12',
        rest: 60,
        description: 'Stand on band, curl handles up with palms forward. Keep elbows pinned to sides. Squeeze at the top and lower with a 3-second negative.',
      },
      {
        id: 'pull_aparts',
        name: 'Pull-Aparts',
        sets: 3,
        reps: '15',
        rest: 30,
        description: 'Hold band in front at shoulder height with straight arms. Pull apart until band touches chest. Squeeze shoulder blades. Return slowly.',
      },
      {
        id: 'dead_bugs',
        name: 'Dead Bugs',
        sets: 3,
        reps: '10',
        rest: 60,
        description: 'Lie on back with band around feet and hands. Extend opposite arm and leg while maintaining contact between lower back and floor. Alternate sides.',
      },
    ],
  },
};

function getTodaysWorkout() {
  const dayOfWeek = getDayOfWeek();
  if (dayOfWeek === 0) return 'A';
  if (dayOfWeek === 2) return 'B';
  if (dayOfWeek === 4) return 'C';
  return null;
}

function getWorkoutDayLabel() {
  const dayOfWeek = getDayOfWeek();
  if (dayOfWeek === 0) return 'Monday';
  if (dayOfWeek === 2) return 'Wednesday';
  if (dayOfWeek === 4) return 'Friday';
  return null;
}

function getNextWorkoutDay() {
  const dayOfWeek = getDayOfWeek();
  const schedule = [0, 2, 4];
  for (const d of schedule) {
    if (d > dayOfWeek) {
      const names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return names[d];
    }
  }
  return 'Monday';
}

function getNextWorkoutType() {
  const dayOfWeek = getDayOfWeek();
  if (dayOfWeek < 2) return 'B';
  if (dayOfWeek < 4) return 'C';
  return 'A';
}

const REST_PRESETS = [
  { label: '30s', seconds: 30 },
  { label: '60s', seconds: 60 },
  { label: '90s', seconds: 90 },
];

const TABS = [
  { id: 'workout', label: "Today's Workout", icon: Dumbbell },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'body', label: 'Body Stats', icon: Scale },
];

function RestTimer({ onComplete }) {
  const [selectedPreset, setSelectedPreset] = useState(60);
  const timer = useTimer(selectedPreset, {
    countdown: true,
    onComplete: () => {
      onComplete?.();
    },
  });

  const handlePreset = (seconds) => {
    setSelectedPreset(seconds);
    timer.reset(seconds);
  };

  const progress = selectedPreset > 0 ? ((selectedPreset - timer.time) / selectedPreset) * 100 : 0;

  return (
    <GlassCard className="text-center">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-white flex items-center gap-2">
          <Timer size={18} style={{ color: ACCENT }} />
          Rest Timer
        </h3>
        <div className="flex gap-1.5">
          {REST_PRESETS.map((preset) => (
            <button
              key={preset.seconds}
              onClick={() => handlePreset(preset.seconds)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedPreset === preset.seconds
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-white/40 hover:text-white/60 bg-white/5'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center my-6">
        <ProgressRing
          value={timer.isRunning || timer.time < selectedPreset ? progress : 0}
          size={160}
          strokeWidth={10}
          color={ACCENT}
          label={timer.formatted}
          sublabel={timer.isRunning ? 'Resting...' : timer.time === 0 ? 'Done!' : 'Ready'}
        />
      </div>

      <div className="flex items-center justify-center gap-3">
        {!timer.isRunning && timer.time > 0 && (
          <button
            onClick={timer.start}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 active:scale-90 transition-transform"
          >
            <Play size={22} className="text-white ml-0.5" />
          </button>
        )}
        {timer.isRunning && (
          <button
            onClick={timer.pause}
            className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
          >
            <Pause size={22} className="text-white" />
          </button>
        )}
        <button
          onClick={() => timer.reset(selectedPreset)}
          className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all"
        >
          <RotateCcw size={20} className="text-white/60" />
        </button>
      </div>

      {timer.time === 0 && !timer.isRunning && selectedPreset > 0 && (
        <p className="text-sm text-green-400 mt-3 animate-pulse">Rest complete! Ready for next set.</p>
      )}
    </GlassCard>
  );
}

function ExerciseCard({ exercise, completedSets, onToggleSet, workoutColor }) {
  const [expanded, setExpanded] = useState(false);
  const allCompleted = completedSets.length === exercise.sets;

  return (
    <GlassCard padding="p-0" className={`overflow-hidden transition-all ${allCompleted ? 'opacity-70' : ''}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: allCompleted ? '#22c55e20' : `${workoutColor}20` }}
        >
          {allCompleted ? (
            <Check size={20} className="text-green-400" />
          ) : (
            <Dumbbell size={18} style={{ color: workoutColor }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium text-sm ${allCompleted ? 'text-white/50 line-through' : 'text-white'}`}>
              {exercise.name}
            </span>
          </div>
          <span className="text-xs text-white/40">
            {exercise.sets} x {exercise.reps} &middot; {exercise.rest}s rest
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">
            {completedSets.length}/{exercise.sets}
          </span>
          {expanded ? (
            <ChevronUp size={16} className="text-white/30" />
          ) : (
            <ChevronDown size={16} className="text-white/30" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5">
          <p className="text-xs text-white/40 mt-3 mb-4 leading-relaxed">{exercise.description}</p>
          <div className="flex gap-2">
            {Array.from({ length: exercise.sets }, (_, i) => {
              const completed = completedSets.includes(i);
              return (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSet(exercise.id, i);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                    completed
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {completed ? (
                    <span className="flex items-center justify-center gap-1">
                      <Check size={12} /> Set {i + 1}
                    </span>
                  ) : (
                    `Set ${i + 1}`
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </GlassCard>
  );
}

function WorkoutTab({ todayKey, fitnessData, setFitnessData }) {
  const workoutType = getTodaysWorkout();
  const workout = workoutType ? WORKOUT_SCHEDULE[workoutType] : null;

  const todayLog = fitnessData.workoutLogs[todayKey] || {};
  const completedSetsMap = todayLog.completedSets || {};
  const workoutCompleted = todayLog.completed || false;

  const totalSets = workout ? workout.exercises.reduce((sum, ex) => sum + ex.sets, 0) : 0;
  const completedCount = Object.values(completedSetsMap).reduce((sum, sets) => sum + sets.length, 0);
  const progressPercent = totalSets > 0 ? Math.round((completedCount / totalSets) * 100) : 0;

  const handleToggleSet = useCallback((exerciseId, setIndex) => {
    setFitnessData((prev) => {
      const log = prev.workoutLogs[todayKey] || { completedSets: {}, completed: false, type: workoutType };
      const currentSets = log.completedSets[exerciseId] || [];
      let newSets;
      if (currentSets.includes(setIndex)) {
        newSets = currentSets.filter((s) => s !== setIndex);
      } else {
        newSets = [...currentSets, setIndex];
      }
      const newCompletedSets = { ...log.completedSets, [exerciseId]: newSets };
      const allTotal = workout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
      const allDone = Object.values(newCompletedSets).reduce((sum, s) => sum + s.length, 0);
      const isComplete = allDone === allTotal;

      return {
        ...prev,
        workoutLogs: {
          ...prev.workoutLogs,
          [todayKey]: {
            ...log,
            type: workoutType,
            completedSets: newCompletedSets,
            completed: isComplete,
            completedAt: isComplete ? new Date().toISOString() : null,
          },
        },
      };
    });
  }, [todayKey, workoutType, workout, setFitnessData]);

  if (!workout) {
    const nextDay = getNextWorkoutDay();
    const nextType = getNextWorkoutType();
    const nextWorkout = WORKOUT_SCHEDULE[nextType];
    return (
      <div className="space-y-4">
        <GlassCard className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} style={{ color: ACCENT }} />
          </div>
          <h3 className="font-heading font-semibold text-white text-lg mb-2">Rest Day</h3>
          <p className="text-sm text-white/50 mb-4">
            Recovery is part of the process. Your muscles grow while you rest.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5">
            <Dumbbell size={16} style={{ color: nextWorkout.color }} />
            <span className="text-sm text-white/70">
              Next: <span className="text-white font-medium">{nextWorkout.name}</span> on {nextDay}
            </span>
          </div>
        </GlassCard>

        <RestTimer />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge color={workout.color}>{workout.dayLabel}</Badge>
              <h3 className="font-heading font-semibold text-white">{workout.name}</h3>
            </div>
            <p className="text-xs text-white/40">
              {getDayName()} &middot; {workout.exercises.length} exercises &middot; ~35 min
            </p>
          </div>
          {workoutCompleted && (
            <div className="flex items-center gap-1.5 text-green-400">
              <Check size={18} />
              <span className="text-xs font-medium">Done!</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-3">
          <ProgressBar value={completedCount} max={totalSets} color={workout.color} height={6} className="flex-1" />
          <span className="text-xs text-white/50 flex-shrink-0">{progressPercent}%</span>
        </div>
      </GlassCard>

      <div className="space-y-3">
        {workout.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            completedSets={completedSetsMap[exercise.id] || []}
            onToggleSet={handleToggleSet}
            workoutColor={workout.color}
          />
        ))}
      </div>

      <RestTimer />
    </div>
  );
}

function ProgressTab({ fitnessData }) {
  const workoutLogs = fitnessData.workoutLogs || {};

  const completedWorkouts = useMemo(() => {
    return Object.entries(workoutLogs)
      .filter(([, log]) => log.completed)
      .sort(([a], [b]) => b.localeCompare(a));
  }, [workoutLogs]);

  const currentStreak = useMemo(() => {
    const today = new Date();
    const scheduleDays = [0, 2, 4];
    let streak = 0;
    let checkDate = new Date(today);

    for (let i = 0; i < 60; i++) {
      checkDate.setDate(checkDate.getDate() - (i === 0 ? 0 : 1));
      const dayOfWeek = (checkDate.getDay() + 6) % 7;

      if (!scheduleDays.includes(dayOfWeek)) continue;

      const key = getDateKey(checkDate);
      const log = workoutLogs[key];

      if (log && log.completed) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }, [workoutLogs]);

  const thisWeekCompleted = useMemo(() => {
    const today = new Date();
    const dayOfWeek = getDayOfWeek(today);
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);
    monday.setHours(0, 0, 0, 0);

    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = getDateKey(d);
      if (workoutLogs[key]?.completed) count++;
    }
    return count;
  }, [workoutLogs]);

  const weekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = getDayOfWeek(today);
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = getDateKey(d);
      const isWorkoutDay = [0, 2, 4].includes(i);
      const completed = workoutLogs[key]?.completed || false;
      const isToday = isSameDay(d, today);
      return {
        label: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i],
        isWorkoutDay,
        completed,
        isToday,
        date: d,
      };
    });
  }, [workoutLogs]);

  const totalCompleted = completedWorkouts.length;
  const byType = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0 };
    completedWorkouts.forEach(([, log]) => {
      if (log.type && counts[log.type] !== undefined) counts[log.type]++;
    });
    return counts;
  }, [completedWorkouts]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <GlassCard padding="p-4" className="text-center">
          <div className="text-2xl font-heading font-bold text-white mb-1">
            <AnimatedNumber value={currentStreak} />
          </div>
          <p className="text-xs text-white/40">Streak</p>
        </GlassCard>
        <GlassCard padding="p-4" className="text-center">
          <div className="text-2xl font-heading font-bold text-white mb-1">
            <AnimatedNumber value={thisWeekCompleted} />
            <span className="text-white/40 text-sm">/3</span>
          </div>
          <p className="text-xs text-white/40">This Week</p>
        </GlassCard>
        <GlassCard padding="p-4" className="text-center">
          <div className="text-2xl font-heading font-bold text-white mb-1">
            <AnimatedNumber value={totalCompleted} />
          </div>
          <p className="text-xs text-white/40">Total</p>
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="font-heading font-semibold text-white mb-4">Weekly Streak</h3>
        <div className="flex justify-between">
          {weekDays.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  day.completed
                    ? 'bg-green-500/20 border border-green-500/40'
                    : day.isWorkoutDay
                    ? day.isToday
                      ? 'bg-violet-500/20 border border-violet-500/40'
                      : 'bg-white/5 border border-white/10'
                    : 'bg-white/[0.02] border border-transparent'
                }`}
              >
                {day.completed ? (
                  <Check size={18} className="text-green-400" />
                ) : day.isWorkoutDay ? (
                  <Dumbbell size={16} className={day.isToday ? 'text-violet-400' : 'text-white/20'} />
                ) : (
                  <span className="text-white/10 text-xs">-</span>
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  day.isToday ? 'text-violet-400' : day.completed ? 'text-green-400' : 'text-white/30'
                }`}
              >
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="font-heading font-semibold text-white mb-4">Workout Distribution</h3>
        <div className="space-y-3">
          {Object.entries(WORKOUT_SCHEDULE).map(([key, workout]) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-white/70">
                  {workout.dayLabel}: {workout.name}
                </span>
                <span className="text-white/50">{byType[key]}x</span>
              </div>
              <ProgressBar
                value={byType[key]}
                max={Math.max(totalCompleted > 0 ? Math.ceil(totalCompleted / 3) + 1 : 4, byType[key] + 1)}
                color={workout.color}
                height={6}
              />
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="font-heading font-semibold text-white mb-4">Completed Workouts</h3>
        {completedWorkouts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-white/40">No completed workouts yet. Start your first session!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {completedWorkouts.slice(0, 20).map(([dateKey, log]) => {
              const ws = WORKOUT_SCHEDULE[log.type];
              return (
                <div
                  key={dateKey}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: ws ? `${ws.color}20` : `${ACCENT}20` }}
                  >
                    <Check size={16} style={{ color: ws ? ws.color : ACCENT }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{ws ? ws.name : 'Workout'}</p>
                    <p className="text-xs text-white/40">{formatDate(dateKey)}</p>
                  </div>
                  <Badge color={ws ? ws.color : ACCENT} variant="outlined" size="sm">
                    {ws ? ws.dayLabel : log.type}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function BodyStatsTab({ fitnessData, setFitnessData }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    weight: '',
    chest: '',
    waist: '',
    hips: '',
    arms: '',
    thighs: '',
  });

  const bodyStats = fitnessData.bodyStats || [];

  const handleSave = () => {
    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      dateKey: getDateKey(),
      ...Object.fromEntries(
        Object.entries(formData)
          .filter(([, v]) => v !== '')
          .map(([k, v]) => [k, parseFloat(v)])
      ),
    };

    if (Object.keys(entry).length <= 3) return;

    setFitnessData((prev) => ({
      ...prev,
      bodyStats: [entry, ...(prev.bodyStats || [])],
    }));
    setFormData({ weight: '', chest: '', waist: '', hips: '', arms: '', thighs: '' });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setFitnessData((prev) => ({
      ...prev,
      bodyStats: (prev.bodyStats || []).filter((s) => s.id !== id),
    }));
  };

  const latestStats = bodyStats[0] || null;
  const previousStats = bodyStats[1] || null;

  const getChange = (field) => {
    if (!latestStats || !previousStats) return null;
    if (latestStats[field] === undefined || previousStats[field] === undefined) return null;
    return latestStats[field] - previousStats[field];
  };

  const statFields = [
    { key: 'weight', label: 'Weight', unit: 'kg', icon: Scale, color: '#a78bfa' },
    { key: 'chest', label: 'Chest', unit: 'cm', icon: Ruler, color: '#6366f1' },
    { key: 'waist', label: 'Waist', unit: 'cm', icon: Ruler, color: '#22c55e' },
    { key: 'hips', label: 'Hips', unit: 'cm', icon: Ruler, color: '#ec4899' },
    { key: 'arms', label: 'Arms', unit: 'cm', icon: Ruler, color: '#f59e0b' },
    { key: 'thighs', label: 'Thighs', unit: 'cm', icon: Ruler, color: '#38bdf8' },
  ];

  return (
    <div className="space-y-4">
      {latestStats && (
        <div className="grid grid-cols-3 gap-3">
          {statFields
            .filter((f) => latestStats[f.key] !== undefined)
            .slice(0, 6)
            .map((field) => {
              const change = getChange(field.key);
              return (
                <GlassCard key={field.key} padding="p-3" className="text-center">
                  <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ background: `${field.color}20` }}>
                    <field.icon size={14} style={{ color: field.color }} />
                  </div>
                  <div className="text-lg font-heading font-bold text-white">
                    {latestStats[field.key]}
                  </div>
                  <p className="text-[10px] text-white/40">{field.unit}</p>
                  <p className="text-xs text-white/50 mt-0.5">{field.label}</p>
                  {change !== null && (
                    <p className={`text-[10px] mt-1 ${change < 0 ? 'text-green-400' : change > 0 ? 'text-yellow-400' : 'text-white/30'}`}>
                      {change > 0 ? '+' : ''}
                      {change.toFixed(1)}
                    </p>
                  )}
                </GlassCard>
              );
            })}
        </div>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-xl border border-dashed border-white/10 text-white/50 text-sm hover:bg-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Log Body Stats
        </button>
      ) : (
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-white">Log Measurements</h3>
            <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white/50">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {statFields.map((field) => (
              <div key={field.key}>
                <label className="text-xs text-white/40 mb-1 block">{field.label} ({field.unit})</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData[field.key]}
                  onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder="—"
                  className="glass-input w-full text-sm py-2 px-3"
                />
              </div>
            ))}
          </div>
          <button onClick={handleSave} className="btn-primary w-full text-sm">
            Save Measurements
          </button>
        </GlassCard>
      )}

      <GlassCard>
        <h3 className="font-heading font-semibold text-white mb-4">History</h3>
        {bodyStats.length === 0 ? (
          <EmptyState
            icon={Scale}
            title="No body stats logged"
            description="Track your measurements to see progress over time."
          />
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {bodyStats.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between py-3 px-3 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <div>
                  <p className="text-sm text-white font-medium">{formatDateShort(entry.date)}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                    {entry.weight !== undefined && (
                      <span className="text-xs text-white/40">{entry.weight}kg</span>
                    )}
                    {entry.chest !== undefined && (
                      <span className="text-xs text-white/40">Chest: {entry.chest}cm</span>
                    )}
                    {entry.waist !== undefined && (
                      <span className="text-xs text-white/40">Waist: {entry.waist}cm</span>
                    )}
                    {entry.hips !== undefined && (
                      <span className="text-xs text-white/40">Hips: {entry.hips}cm</span>
                    )}
                    {entry.arms !== undefined && (
                      <span className="text-xs text-white/40">Arms: {entry.arms}cm</span>
                    )}
                    {entry.thighs !== undefined && (
                      <span className="text-xs text-white/40">Thighs: {entry.thighs}cm</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-white/20 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

const DEFAULT_FITNESS_DATA = {
  workoutLogs: {},
  bodyStats: [],
};

export default function FitnessPage() {
  const [activeTab, setActiveTab] = useState('workout');
  const [fitnessData, setFitnessData] = useLocalStorage(
    NAMESPACES.fitness,
    null,
    DEFAULT_FITNESS_DATA
  );

  const todayKey = getDateKey();

  const workoutType = getTodaysWorkout();
  const workout = workoutType ? WORKOUT_SCHEDULE[workoutType] : null;

  const subtitle = workout
    ? `${workout.dayLabel}: ${workout.name} — ${getDayName()}`
    : `Rest Day — Next: ${getNextWorkoutDay()}`;

  return (
    <div className="space-y-6 pb-4">
      <PageHeader
        title="Fitness"
        subtitle={subtitle}
        rightElement={
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
              <Dumbbell size={20} style={{ color: ACCENT }} />
            </div>
          </div>
        }
      />

      <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'workout' && (
        <WorkoutTab
          todayKey={todayKey}
          fitnessData={fitnessData}
          setFitnessData={setFitnessData}
        />
      )}

      {activeTab === 'progress' && <ProgressTab fitnessData={fitnessData} />}

      {activeTab === 'body' && (
        <BodyStatsTab fitnessData={fitnessData} setFitnessData={setFitnessData} />
      )}
    </div>
  );
}
