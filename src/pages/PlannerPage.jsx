import { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Check, X, Sun, Sunset, Moon,
  Briefcase, Dumbbell, Mic, BookOpen, DollarSign, User, Flame, Calendar, Trash2
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import ProgressBar from '../components/ProgressBar';
import Badge from '../components/Badge';
import FloatingActionButton from '../components/FloatingActionButton';
import useLocalStorage from '../hooks/useLocalStorage';
import { formatDate, getDayName, getDateKey, addDays, isSameDay, getWeekDates, isToday } from '../utils/dateHelpers';
import { COLORS, DAYS_SHORT } from '../utils/constants';

const categoryIcons = { work: Briefcase, fitness: Dumbbell, vocals: Mic, reading: BookOpen, finance: DollarSign, personal: User };
const categoryLabels = ['Work', 'Fitness', 'Vocals', 'Reading', 'Finance', 'Personal'];
const moods = ['😫', '😕', '😐', '🙂', '😄'];
const timeBlocks = [
  { id: 'morning', label: 'Morning', icon: Sun, range: '6:00 — 12:00' },
  { id: 'afternoon', label: 'Afternoon', icon: Sunset, range: '12:00 — 18:00' },
  { id: 'evening', label: 'Evening', icon: Moon, range: '18:00 — 23:00' },
];

const defaultHabits = [
  { id: 'morning_routine', label: 'Morning routine', short: 'AM' },
  { id: 'exercise', label: 'Exercise', short: 'FIT' },
  { id: 'vocal_practice', label: 'Vocal practice', short: 'VOX' },
  { id: 'read_15', label: 'Read 15 min', short: 'RD' },
  { id: 'budget_check', label: 'Budget check', short: 'BG' },
  { id: 'sleep_11pm', label: 'Sleep by 11pm', short: 'SLP' },
  { id: 'no_screens', label: 'No screens 10pm', short: 'SCR' },
];

export default function PlannerPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('day');
  const [showAddTask, setShowAddTask] = useState(false);
  const dateKey = getDateKey(selectedDate);

  const [allTasks, setAllTasks] = useLocalStorage('lifeos_planner', 'tasks', {});
  const [allHabits, setAllHabits] = useLocalStorage('lifeos_planner', 'habits', {});
  const [reflections, setReflections] = useLocalStorage('lifeos_planner', 'reflections', {});

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'n') {
        e.preventDefault();
        setShowAddTask(true);
      }
      if (e.key === 'Escape') {
        setShowAddTask(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const tasks = allTasks[dateKey] || [];
  const dayHabits = allHabits[dateKey] || {};
  const reflection = reflections[dateKey] || { mood: -1, note: '' };

  const setTasks = (newTasks) => setAllTasks({ ...allTasks, [dateKey]: newTasks });
  const setDayHabits = (h) => setAllHabits({ ...allHabits, [dateKey]: h });
  const setReflection = (r) => setReflections({ ...reflections, [dateKey]: r });

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addTask = (task) => {
    setTasks([...tasks, { ...task, id: Date.now().toString(), done: false }]);
    setShowAddTask(false);
  };

  const getStreak = (habitId) => {
    let streak = 0;
    let d = new Date();
    while (true) {
      const k = getDateKey(d);
      if (allHabits[k]?.[habitId]) { streak++; d = addDays(d, -1); }
      else break;
    }
    return streak;
  };

  const completedTasks = tasks.filter(t => t.done).length;
  const suggestions = [];
  if (!tasks.some(t => t.category === 'vocals' && t.done)) suggestions.push("You haven't done vocal practice today");
  if (!tasks.some(t => t.category === 'fitness' && t.done)) {
    const dow = selectedDate.getDay();
    if ([1, 3, 5].includes(dow)) suggestions.push("It's a resistance band day!");
  }

  const weekDates = getWeekDates(selectedDate);

  return (
    <div className="space-y-5 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Planner</h1>
          <p className="text-sm text-white/50 mt-1">{getDayName(selectedDate)}, {formatDate(selectedDate)}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView(view === 'day' ? 'week' : 'day')}
            className={`btn-ghost text-xs ${view === 'week' ? 'bg-indigo-500/20 text-indigo-300' : ''}`}
          >
            <Calendar size={14} className="inline mr-1" />
            {view === 'day' ? 'Week' : 'Day'}
          </button>
        </div>
      </div>

      {/* Date Selector */}
      <div className="flex items-center justify-between">
        <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ChevronLeft size={18} className="text-white/60" />
        </button>
        <div className="flex gap-2">
          {weekDates.map((d, i) => {
            const active = isSameDay(d, selectedDate);
            const today = isToday(d);
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(d)}
                className={`flex flex-col items-center w-10 py-2 rounded-xl transition-all ${
                  active ? 'bg-gradient-to-b from-indigo-500/20 to-violet-500/20 border border-indigo-500/30' : 'hover:bg-white/5'
                }`}
              >
                <span className="text-[10px] text-white/40">{DAYS_SHORT[i]}</span>
                <span className={`text-sm font-medium mt-1 ${active ? 'text-white' : today ? 'text-indigo-400' : 'text-white/60'}`}>
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>
        <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ChevronRight size={18} className="text-white/60" />
        </button>
      </div>

      {/* Habit Tracker Strip */}
      <div className="overflow-x-auto no-scrollbar -mx-5 px-5">
        <div className="flex gap-3">
          {defaultHabits.map(habit => {
            const checked = !!dayHabits[habit.id];
            const streak = getStreak(habit.id);
            return (
              <button
                key={habit.id}
                onClick={() => setDayHabits({ ...dayHabits, [habit.id]: !checked })}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
                title={habit.label}
              >
                <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${
                  checked ? 'border-indigo-400 bg-indigo-500/20' : 'border-white/15 bg-white/5'
                }`}>
                  {checked ? <Check size={16} className="text-indigo-400" /> : <span className="text-[10px] text-white/40">{habit.short}</span>}
                </div>
                {streak > 0 && (
                  <span className="text-[9px] text-indigo-400 flex items-center gap-0.5">
                    <Flame size={8} />{streak}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <div key={i} className="glass-card-sm px-4 py-3 flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
              <span className="text-white/70">{s}</span>
            </div>
          ))}
        </div>
      )}

      {view === 'day' ? (
        <>
          {/* Day View - Time Blocks */}
          <div className="space-y-4">
            {timeBlocks.map(block => {
              const blockTasks = tasks.filter(t => t.block === block.id);
              return (
                <GlassCard key={block.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <block.icon size={16} className="text-white/40" />
                    <h3 className="text-sm font-heading font-semibold text-white">{block.label}</h3>
                    <span className="text-xs text-white/30 ml-auto">{block.range}</span>
                  </div>
                  {blockTasks.length === 0 ? (
                    <p className="text-xs text-white/30 py-2">No tasks scheduled</p>
                  ) : (
                    <div className="space-y-2">
                      {blockTasks.map(task => {
                        const Icon = categoryIcons[task.category] || User;
                        return (
                          <div
                            key={task.id}
                            onClick={() => toggleTask(task.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                              task.done ? 'bg-white/[0.02] opacity-60' : 'bg-white/5 hover:bg-white/[0.07]'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              task.done ? 'border-indigo-400 bg-indigo-500/30' : 'border-white/20'
                            }`}>
                              {task.done && <Check size={10} className="text-indigo-400" />}
                            </div>
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[task.category] }} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${task.done ? 'line-through text-white/40' : 'text-white'}`}>{task.title}</p>
                            </div>
                            <span className="text-xs text-white/30 flex-shrink-0">{task.time}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                              className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors flex-shrink-0"
                            >
                              <Trash2 size={14} className="text-white/30 hover:text-red-400" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>

          {/* Progress */}
          {tasks.length > 0 && (
            <GlassCard padding="p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/60">Day Progress</span>
                <span className="text-white/40">{completedTasks}/{tasks.length} tasks</span>
              </div>
              <ProgressBar value={completedTasks} max={tasks.length} />
            </GlassCard>
          )}

          {/* Daily Reflection */}
          <GlassCard>
            <h3 className="text-sm font-heading font-semibold text-white mb-3">Daily Reflection</h3>
            <div className="flex gap-3 mb-4">
              {moods.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setReflection({ ...reflection, mood: i })}
                  className={`text-2xl p-2 rounded-xl transition-all ${
                    reflection.mood === i ? 'bg-indigo-500/20 scale-110' : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="How was your day?"
              value={reflection.note}
              onChange={(e) => setReflection({ ...reflection, note: e.target.value })}
              className="glass-input text-sm"
            />
          </GlassCard>
        </>
      ) : (
        /* Week View */
        <GlassCard>
          <h3 className="text-sm font-heading font-semibold text-white mb-4">Weekly Overview</h3>
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((d, i) => {
              const k = getDateKey(d);
              const dayTasks = allTasks[k] || [];
              const done = dayTasks.filter(t => t.done).length;
              const total = dayTasks.length;
              const pct = total ? (done / total) * 100 : 0;
              const today = isToday(d);
              return (
                <button
                  key={i}
                  onClick={() => { setSelectedDate(d); setView('day'); }}
                  className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-all"
                >
                  <span className="text-[10px] text-white/40">{DAYS_SHORT[i]}</span>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-medium border ${
                      today ? 'border-indigo-400' : 'border-transparent'
                    }`}
                    style={{
                      background: pct > 0 ? `rgba(99,102,241,${Math.max(0.1, pct / 100 * 0.5)})` : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    {d.getDate()}
                  </div>
                  <span className="text-[9px] text-white/30">{total > 0 ? `${done}/${total}` : '-'}</span>
                </button>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Add Task Modal */}
      {showAddTask && <AddTaskModal onAdd={addTask} onClose={() => setShowAddTask(false)} />}

      <FloatingActionButton onClick={() => setShowAddTask(true)} />
    </div>
  );
}

function AddTaskModal({ onAdd, onClose }) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [category, setCategory] = useState('work');
  const [block, setBlock] = useState('morning');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), time, category, block });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative glass-card w-full max-w-md p-6 mx-4 mb-6 md:mb-0 max-h-[80vh] overflow-y-auto animate-slideUp" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading font-semibold text-white text-lg">Add Task</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <X size={16} className="text-white/70" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="glass-input"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="glass-input text-sm" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Block</label>
              <select value={block} onChange={e => setBlock(e.target.value)} className="glass-input text-sm">
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-white/40 mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {categoryLabels.map(cat => {
                const key = cat.toLowerCase();
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      category === key ? 'text-white' : 'text-white/50 bg-white/5'
                    }`}
                    style={category === key ? { background: `${COLORS[key]}30`, color: COLORS[key] } : {}}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-3">Add Task</button>
        </form>
      </div>
    </div>
  );
}
