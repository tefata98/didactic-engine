import { MONTHS, DAYS_FULL, DAYS_SHORT } from './constants';

export function formatDate(date = new Date()) {
  const d = new Date(date);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatDateShort(date = new Date()) {
  const d = new Date(date);
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}

export function getDayName(date = new Date(), short = false) {
  const d = new Date(date);
  const dayIndex = (d.getDay() + 6) % 7; // Monday = 0
  return short ? DAYS_SHORT[dayIndex] : DAYS_FULL[dayIndex];
}

export function getDayOfWeek(date = new Date()) {
  return (new Date(date).getDay() + 6) % 7; // Monday = 0
}

export function getWeekDates(date = new Date()) {
  const d = new Date(date);
  const dayOfWeek = getDayOfWeek(d);
  const monday = new Date(d);
  monday.setDate(d.getDate() - dayOfWeek);

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return day;
  });
}

export function isSameDay(d1, d2) {
  const a = new Date(d1);
  const b = new Date(d2);
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function isToday(date) {
  return isSameDay(date, new Date());
}

export function getRelativeTime(date) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateShort(d);
}

export function formatTime(hours, minutes) {
  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function getDateKey(date = new Date()) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function getMonthKey(date = new Date()) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
