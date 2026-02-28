import { Camera, MapPin, Briefcase, Mail, Music, GraduationCap, Award, Lock, Star, Flame, BookOpen, Moon, Brain, Heart, Zap, Edit3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import GlassCard from '../components/GlassCard';
import AnimatedNumber from '../components/AnimatedNumber';
import Badge from '../components/Badge';
import { COLORS } from '../utils/constants';

const achievements = [
  { name: '7-Day Streak', icon: Flame, unlocked: true, color: '#f59e0b' },
  { name: 'First Workout', icon: Zap, unlocked: true, color: '#a78bfa' },
  { name: 'Budget Master', icon: Star, unlocked: true, color: '#22c55e' },
  { name: 'Book Worm', icon: BookOpen, unlocked: false, color: '#c084fc' },
  { name: 'Sleep Champion', icon: Moon, unlocked: false, color: '#818cf8' },
  { name: 'Rockstar', icon: Music, unlocked: true, color: '#ec4899' },
  { name: 'Voice of Gold', icon: Award, unlocked: false, color: '#f59e0b' },
  { name: 'Habit Machine', icon: Brain, unlocked: false, color: '#6366f1' },
  { name: 'Phoenix Rising', icon: Heart, unlocked: false, color: '#ef4444' },
];

const quickStats = [
  { label: 'Days Active', value: 47 },
  { label: 'Goals Met', value: 23 },
  { label: 'Best Streak', value: 12 },
];

export default function ProfilePage() {
  const { state } = useApp();
  const { user } = state;

  return (
    <div className="space-y-6 pb-4">
      {/* Avatar & Info */}
      <div className="flex flex-col items-center text-center pt-4">
        <div className="relative mb-4">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 p-[3px]">
            <div className="w-full h-full rounded-full bg-base flex items-center justify-center">
              <span className="text-4xl font-heading font-bold gradient-text">{user.name[0]}</span>
            </div>
          </div>
          <button className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg">
            <Camera size={16} className="text-white" />
          </button>
        </div>
        <h1 className="text-2xl font-heading font-bold text-white">{user.name}</h1>
        <p className="text-sm text-white/50 mt-1">{user.role}</p>
        <div className="flex items-center gap-1 mt-2 text-white/40 text-sm">
          <MapPin size={14} />
          <span>{user.location}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {quickStats.map(stat => (
          <GlassCard key={stat.label} padding="p-4" className="text-center">
            <div className="text-xl font-heading font-bold text-white">
              <AnimatedNumber value={stat.value} />
            </div>
            <p className="text-xs text-white/40 mt-1">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* About */}
      <GlassCard>
        <h3 className="font-heading font-semibold text-white mb-4">About</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Briefcase size={16} className="text-white/40 flex-shrink-0" />
            <span className="text-white/70">{user.role} at <span className="text-white">{user.company}</span></span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Music size={16} className="text-white/40 flex-shrink-0" />
            <span className="text-white/70">{user.bandRole} in <span className="text-white">{user.band}</span></span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <GraduationCap size={16} className="text-white/40 flex-shrink-0" />
            <span className="text-white/70">{user.education}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Award size={16} className="text-white/40 flex-shrink-0" />
            <span className="text-white/70">SLS & Diaphragmatic Breathing</span>
          </div>
        </div>
      </GlassCard>

      {/* Q1 Focus Areas */}
      <GlassCard>
        <h3 className="font-heading font-semibold text-white mb-4">Q1 Focus Areas</h3>
        <div className="flex flex-wrap gap-2">
          {user.focusAreas.map(area => (
            <Badge key={area} color={COLORS.primary} size="md">{area}</Badge>
          ))}
        </div>
      </GlassCard>

      {/* Achievements */}
      <GlassCard>
        <h3 className="font-heading font-semibold text-white mb-4">Achievements</h3>
        <div className="grid grid-cols-3 gap-3">
          {achievements.map(ach => (
            <div
              key={ach.name}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl text-center transition-all ${
                ach.unlocked ? 'bg-white/5' : 'opacity-40'
              }`}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: ach.unlocked ? `${ach.color}20` : 'rgba(255,255,255,0.05)' }}
              >
                {ach.unlocked ? (
                  <ach.icon size={22} style={{ color: ach.color }} />
                ) : (
                  <Lock size={18} className="text-white/30" />
                )}
              </div>
              <span className="text-[10px] text-white/60 font-medium leading-tight">{ach.name}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Edit Profile Button */}
      <button className="btn-primary w-full flex items-center justify-center gap-2 py-4">
        <Edit3 size={18} />
        Edit Profile
      </button>
    </div>
  );
}
