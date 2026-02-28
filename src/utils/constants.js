export const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  tertiary: '#a78bfa',
  sleep: '#818cf8',
  fitness: '#a78bfa',
  finance: '#22c55e',
  vocals: '#ec4899',
  work: '#6366f1',
  reading: '#c084fc',
  health: '#f59e0b',
  personal: '#38bdf8',
  base: '#0f172a',
};

export const CATEGORY_CONFIG = {
  work: { label: 'Work', color: COLORS.work },
  fitness: { label: 'Fitness', color: COLORS.fitness },
  vocals: { label: 'Vocals', color: COLORS.vocals },
  reading: { label: 'Reading', color: COLORS.reading },
  finance: { label: 'Finance', color: COLORS.finance },
  personal: { label: 'Personal', color: COLORS.personal },
  sleep: { label: 'Sleep', color: COLORS.sleep },
  health: { label: 'Health', color: COLORS.health },
};

export const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const NAMESPACES = {
  planner: 'lifeos_planner',
  fitness: 'lifeos_fitness',
  vocals: 'lifeos_vocals',
  finance: 'lifeos_finance',
  reading: 'lifeos_reading',
  sleep: 'lifeos_sleep',
  settings: 'lifeos_settings',
  identity: 'lifeos_identity',
  news: 'lifeos_news',
};

export const DEFAULT_SETTINGS = {
  notifications: true,
  darkMode: true,
  soundEffects: true,
  autoSync: false,
  faceId: false,
  offlineMode: true,
  reminders: {
    sleepWindDown: { enabled: true, time: '22:30' },
    workout: { enabled: true, days: ['Mon', 'Wed', 'Fri'], time: '07:00' },
    vocalPractice: { enabled: true, time: '18:00' },
    budgetAlerts: { enabled: true },
    readingGoal: { enabled: true, time: '21:00' },
  },
};

export const USER_PROFILE = {
  name: 'Stefan',
  role: 'Senior Talent Acquisition Specialist',
  company: 'EGT Digital',
  location: 'Sofia, Bulgaria',
  email: 'stefan@egtdigital.com',
  band: 'Phoenix',
  bandRole: 'Vocalist',
  education: 'MSc Organizational Psychology',
  focusAreas: ['Better Sleep', 'Resistance Training', 'Financial Tracking', 'SLS Vocal Training', 'Reading Habit', 'Stress Management'],
};

export const EXPENSE_CATEGORIES = [
  'Rent', 'Utilities', 'Food', 'Transport', 'Music Gear',
  'Going Out', 'Subscriptions', 'Savings', 'Investment', 'Other',
];
