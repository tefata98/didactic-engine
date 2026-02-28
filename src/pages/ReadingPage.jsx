import { useState, useMemo } from 'react';
import {
  BookOpen, Plus, X, Star, Flame, Calendar, BookMarked,
  Library, ChevronRight, Clock, Target, TrendingUp, Check, Edit3, Trash2
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import PageHeader from '../components/PageHeader';
import TabBar from '../components/TabBar';
import ProgressBar from '../components/ProgressBar';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import FloatingActionButton from '../components/FloatingActionButton';
import AnimatedNumber from '../components/AnimatedNumber';
import useLocalStorage from '../hooks/useLocalStorage';
import { NAMESPACES, COLORS } from '../utils/constants';
import { getDateKey, formatDate } from '../utils/dateHelpers';

const ACCENT = '#c084fc';

const CATEGORY_GRADIENTS = {
  Sleep: ['#818cf8', '#6366f1'],
  Habits: ['#a78bfa', '#7c3aed'],
  Creativity: ['#f472b6', '#ec4899'],
  Music: ['#fb923c', '#f97316'],
  Recruitment: ['#38bdf8', '#0ea5e9'],
  Psychology: ['#34d399', '#10b981'],
  Health: ['#f59e0b', '#d97706'],
  Finance: ['#22c55e', '#16a34a'],
  Vocals: ['#ec4899', '#db2777'],
  Fiction: ['#c084fc', '#a855f7'],
  Science: ['#60a5fa', '#3b82f6'],
  Technology: ['#6366f1', '#4f46e5'],
  Other: ['#94a3b8', '#64748b'],
};

const WANT_TO_READ_BOOKS = [
  { id: 'wtr-1', title: 'Why We Sleep', author: 'Matthew Walker', category: 'Sleep', totalPages: 368, pagesRead: 0, shelf: 'want' },
  { id: 'wtr-2', title: 'Atomic Habits', author: 'James Clear', category: 'Habits', totalPages: 320, pagesRead: 0, shelf: 'want' },
  { id: 'wtr-3', title: 'The War of Art', author: 'Steven Pressfield', category: 'Creativity', totalPages: 190, pagesRead: 0, shelf: 'want' },
  { id: 'wtr-4', title: 'Effortless Mastery', author: 'Kenny Werner', category: 'Music', totalPages: 256, pagesRead: 0, shelf: 'want' },
  { id: 'wtr-5', title: 'Who', author: 'Geoff Smart', category: 'Recruitment', totalPages: 208, pagesRead: 0, shelf: 'want' },
  { id: 'wtr-6', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Psychology', totalPages: 499, pagesRead: 0, shelf: 'want' },
  { id: 'wtr-7', title: 'The Talent Delusion', author: 'Tomas Chamorro-Premuzic', category: 'Recruitment', totalPages: 272, pagesRead: 0, shelf: 'want' },
  { id: 'wtr-8', title: 'The Body Keeps the Score', author: 'Bessel van der Kolk', category: 'Health', totalPages: 464, pagesRead: 0, shelf: 'want' },
  { id: 'wtr-9', title: 'The Psychology of Money', author: 'Morgan Housel', category: 'Finance', totalPages: 256, pagesRead: 0, shelf: 'want' },
  { id: 'wtr-10', title: 'I Will Teach You to Be Rich', author: 'Ramit Sethi', category: 'Finance', totalPages: 352, pagesRead: 0, shelf: 'want' },
  { id: 'wtr-11', title: 'Singing for the Stars', author: 'Seth Riggs', category: 'Vocals', totalPages: 128, pagesRead: 0, shelf: 'want' },
];

const DEFAULT_DATA = {
  books: [
    { id: 'cur-1', title: 'Deep Work', author: 'Cal Newport', category: 'Habits', totalPages: 296, pagesRead: 142, shelf: 'reading', startDate: '2026-02-10' },
    ...WANT_TO_READ_BOOKS,
    { id: 'done-1', title: 'The Almanack of Naval Ravikant', author: 'Eric Jorgenson', category: 'Finance', totalPages: 242, pagesRead: 242, shelf: 'completed', startDate: '2026-01-05', completedDate: '2026-01-28' },
    { id: 'done-2', title: 'Digital Minimalism', author: 'Cal Newport', category: 'Technology', totalPages: 284, pagesRead: 284, shelf: 'completed', startDate: '2025-12-01', completedDate: '2025-12-22' },
  ],
  readingLog: [
    { id: 'log-1', bookId: 'cur-1', pages: 25, date: getDateKey(new Date(Date.now() - 86400000 * 0)), minutes: 30 },
    { id: 'log-2', bookId: 'cur-1', pages: 18, date: getDateKey(new Date(Date.now() - 86400000 * 1)), minutes: 22 },
    { id: 'log-3', bookId: 'cur-1', pages: 30, date: getDateKey(new Date(Date.now() - 86400000 * 2)), minutes: 35 },
    { id: 'log-4', bookId: 'cur-1', pages: 15, date: getDateKey(new Date(Date.now() - 86400000 * 3)), minutes: 18 },
    { id: 'log-5', bookId: 'cur-1', pages: 22, date: getDateKey(new Date(Date.now() - 86400000 * 5)), minutes: 25 },
    { id: 'log-6', bookId: 'cur-1', pages: 20, date: getDateKey(new Date(Date.now() - 86400000 * 6)), minutes: 24 },
    { id: 'log-7', bookId: 'cur-1', pages: 12, date: getDateKey(new Date(Date.now() - 86400000 * 7)), minutes: 16 },
  ],
  dailyGoal: { minutes: 15, pages: 20 },
};

const SHELF_TABS = [
  { id: 'reading', label: 'Currently Reading', icon: BookOpen },
  { id: 'want', label: 'Want to Read', icon: BookMarked },
  { id: 'completed', label: 'Completed', icon: Check },
];

function BookCover({ category, size = 'md' }) {
  const colors = CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS.Other;
  const sizeClasses = size === 'lg' ? 'w-20 h-28' : size === 'sm' ? 'w-10 h-14' : 'w-14 h-20';

  return (
    <div
      className={`${sizeClasses} rounded-lg flex items-center justify-center flex-shrink-0`}
      style={{
        background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
        boxShadow: `0 4px 12px ${colors[0]}30`,
      }}
    >
      <BookOpen size={size === 'lg' ? 24 : size === 'sm' ? 12 : 16} className="text-white/80" />
    </div>
  );
}

function StarRating({ value, onChange, size = 20 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => onChange?.(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={size}
            className={star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReadingPage() {
  const [data, setData] = useLocalStorage(NAMESPACES.reading, null, DEFAULT_DATA);
  const [activeShelf, setActiveShelf] = useState('reading');
  const [showAddBook, setShowAddBook] = useState(false);
  const [showLogSession, setShowLogSession] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', totalPages: '', category: 'Other' });
  const [logEntry, setLogEntry] = useState({ bookId: '', pages: '', minutes: '', date: getDateKey() });

  const books = data.books || [];
  const readingLog = data.readingLog || [];
  const dailyGoal = data.dailyGoal || { minutes: 15, pages: 20 };

  const currentlyReading = useMemo(() => books.filter(b => b.shelf === 'reading'), [books]);
  const wantToRead = useMemo(() => books.filter(b => b.shelf === 'want'), [books]);
  const completed = useMemo(() => books.filter(b => b.shelf === 'completed'), [books]);

  const shelfBooks = useMemo(() => {
    if (activeShelf === 'reading') return currentlyReading;
    if (activeShelf === 'want') return wantToRead;
    return completed;
  }, [activeShelf, currentlyReading, wantToRead, completed]);

  const readingStreak = useMemo(() => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const dateKey = getDateKey(new Date(today.getTime() - i * 86400000));
      const dayLogs = readingLog.filter(l => l.date === dateKey);
      const totalMinutes = dayLogs.reduce((sum, l) => sum + (l.minutes || 0), 0);
      if (totalMinutes >= 15) {
        streak++;
      } else if (i > 0) {
        break;
      } else {
        break;
      }
    }
    return streak;
  }, [readingLog]);

  const todayStats = useMemo(() => {
    const todayKey = getDateKey();
    const todayLogs = readingLog.filter(l => l.date === todayKey);
    const pagesRead = todayLogs.reduce((sum, l) => sum + (l.pages || 0), 0);
    const minutesRead = todayLogs.reduce((sum, l) => sum + (l.minutes || 0), 0);
    return { pagesRead, minutesRead };
  }, [readingLog]);

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthLogs = readingLog.filter(l => new Date(l.date) >= monthStart);
    const totalPages = monthLogs.reduce((sum, l) => sum + (l.pages || 0), 0);
    const daysWithReading = new Set(monthLogs.map(l => l.date)).size;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysSoFar = now.getDate();
    const avgPagesPerDay = daysSoFar > 0 ? Math.round(totalPages / daysSoFar) : 0;
    return { totalPages, daysWithReading, avgPagesPerDay, daysInMonth };
  }, [readingLog]);

  const booksCompletedThisYear = useMemo(() => {
    const year = new Date().getFullYear();
    return completed.filter(b => b.completedDate && new Date(b.completedDate).getFullYear() === year).length;
  }, [completed]);

  function handleAddBook(e) {
    e.preventDefault();
    if (!newBook.title.trim() || !newBook.author.trim() || !newBook.totalPages) return;
    const book = {
      id: `book-${Date.now()}`,
      title: newBook.title.trim(),
      author: newBook.author.trim(),
      totalPages: parseInt(newBook.totalPages, 10),
      pagesRead: 0,
      category: newBook.category,
      shelf: 'want',
    };
    setData(prev => ({ ...prev, books: [...prev.books, book] }));
    setNewBook({ title: '', author: '', totalPages: '', category: 'Other' });
    setShowAddBook(false);
  }

  function handleLogSession(e) {
    e.preventDefault();
    if (!logEntry.bookId || !logEntry.pages) return;
    const pages = parseInt(logEntry.pages, 10);
    const minutes = parseInt(logEntry.minutes, 10) || 0;
    const entry = {
      id: `log-${Date.now()}`,
      bookId: logEntry.bookId,
      pages,
      minutes,
      date: logEntry.date,
    };
    setData(prev => {
      const updatedBooks = prev.books.map(b => {
        if (b.id === logEntry.bookId) {
          const newPagesRead = Math.min(b.pagesRead + pages, b.totalPages);
          const isCompleted = newPagesRead >= b.totalPages;
          return {
            ...b,
            pagesRead: newPagesRead,
            shelf: isCompleted ? 'completed' : b.shelf,
            completedDate: isCompleted ? getDateKey() : b.completedDate,
          };
        }
        return b;
      });
      return {
        ...prev,
        books: updatedBooks,
        readingLog: [...prev.readingLog, entry],
      };
    });
    setLogEntry({ bookId: '', pages: '', minutes: '', date: getDateKey() });
    setShowLogSession(false);
  }

  function moveToShelf(bookId, shelf) {
    setData(prev => ({
      ...prev,
      books: prev.books.map(b => {
        if (b.id === bookId) {
          return {
            ...b,
            shelf,
            startDate: shelf === 'reading' ? getDateKey() : b.startDate,
            completedDate: shelf === 'completed' ? getDateKey() : undefined,
            pagesRead: shelf === 'completed' ? b.totalPages : b.pagesRead,
          };
        }
        return b;
      }),
    }));
  }

  function deleteBook(bookId) {
    setData(prev => ({
      ...prev,
      books: prev.books.filter(b => b.id !== bookId),
      readingLog: prev.readingLog.filter(l => l.bookId !== bookId),
    }));
  }

  const recentLogs = useMemo(() => {
    return [...readingLog]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10)
      .map(log => {
        const book = books.find(b => b.id === log.bookId);
        return { ...log, bookTitle: book?.title || 'Unknown' };
      });
  }, [readingLog, books]);

  const pagesGoalPercent = Math.min(Math.round((todayStats.pagesRead / dailyGoal.pages) * 100), 100);
  const minutesGoalPercent = Math.min(Math.round((todayStats.minutesRead / dailyGoal.minutes) * 100), 100);

  const categories = ['Other', 'Sleep', 'Habits', 'Creativity', 'Music', 'Recruitment', 'Psychology', 'Health', 'Finance', 'Vocals', 'Fiction', 'Science', 'Technology'];

  return (
    <div className="space-y-6 pb-4">
      <PageHeader
        title="Reading"
        subtitle={`${readingStreak > 0 ? `${readingStreak}-day streak` : 'Start your streak today'}`}
        rightElement={
          <button
            onClick={() => setShowLogSession(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: `${ACCENT}20`, color: ACCENT }}
          >
            <Edit3 size={16} />
            Log
          </button>
        }
      />

      {/* Daily Goal Progress */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-white flex items-center gap-2">
            <Target size={18} style={{ color: ACCENT }} />
            Daily Reading Goal
          </h3>
          {todayStats.pagesRead >= dailyGoal.pages && todayStats.minutesRead >= dailyGoal.minutes && (
            <Badge color="#22c55e">Goal Met</Badge>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-white/70">Pages</span>
              <span className="text-white/50">{todayStats.pagesRead}/{dailyGoal.pages}</span>
            </div>
            <ProgressBar value={todayStats.pagesRead} max={dailyGoal.pages} color={ACCENT} height={6} />
            <p className="text-xs text-white/40 mt-1">{pagesGoalPercent}% complete</p>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-white/70">Minutes</span>
              <span className="text-white/50">{todayStats.minutesRead}/{dailyGoal.minutes} min</span>
            </div>
            <ProgressBar value={todayStats.minutesRead} max={dailyGoal.minutes} color="#a78bfa" height={6} />
            <p className="text-xs text-white/40 mt-1">{minutesGoalPercent}% complete</p>
          </div>
        </div>
      </GlassCard>

      {/* Currently Reading Hero Card */}
      {currentlyReading.length > 0 && (
        <GlassCard>
          <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen size={18} style={{ color: ACCENT }} />
            Currently Reading
          </h3>
          <div className="space-y-4">
            {currentlyReading.map(book => {
              const progress = Math.round((book.pagesRead / book.totalPages) * 100);
              return (
                <div key={book.id} className="flex gap-4">
                  <BookCover category={book.category} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading font-semibold text-white text-base truncate">{book.title}</h4>
                    <p className="text-sm text-white/50 mb-1">{book.author}</p>
                    <Badge color={CATEGORY_GRADIENTS[book.category]?.[0] || '#94a3b8'} variant="outlined">{book.category}</Badge>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-white/50 mb-1">
                        <span>Page {book.pagesRead} of {book.totalPages}</span>
                        <span>{progress}%</span>
                      </div>
                      <ProgressBar value={book.pagesRead} max={book.totalPages} color={ACCENT} height={5} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Reading Streak */}
      <GlassCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
              <Flame size={24} style={{ color: ACCENT }} />
            </div>
            <div>
              <p className="text-sm text-white/50">Reading Streak</p>
              <p className="text-2xl font-heading font-bold text-white">
                <AnimatedNumber value={readingStreak} /> {readingStreak === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40">Goal: 15+ min/day</p>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: 7 }, (_, i) => {
                const dateKey = getDateKey(new Date(Date.now() - (6 - i) * 86400000));
                const dayLogs = readingLog.filter(l => l.date === dateKey);
                const totalMin = dayLogs.reduce((s, l) => s + (l.minutes || 0), 0);
                const met = totalMin >= 15;
                return (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-sm"
                    style={{ background: met ? ACCENT : 'rgba(255,255,255,0.06)' }}
                    title={`${dateKey}: ${totalMin} min`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard padding="p-4">
          <div className="text-center">
            <p className="text-2xl font-heading font-bold text-white">
              <AnimatedNumber value={booksCompletedThisYear} />
            </p>
            <p className="text-xs text-white/40 mt-1">Books This Year</p>
          </div>
        </GlassCard>
        <GlassCard padding="p-4">
          <div className="text-center">
            <p className="text-2xl font-heading font-bold text-white">
              <AnimatedNumber value={monthlyStats.totalPages} />
            </p>
            <p className="text-xs text-white/40 mt-1">Pages This Month</p>
          </div>
        </GlassCard>
        <GlassCard padding="p-4">
          <div className="text-center">
            <p className="text-2xl font-heading font-bold text-white">
              <AnimatedNumber value={monthlyStats.avgPagesPerDay} />
            </p>
            <p className="text-xs text-white/40 mt-1">Avg Pages/Day</p>
          </div>
        </GlassCard>
      </div>

      {/* Book Library */}
      <div>
        <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
          <Library size={18} style={{ color: ACCENT }} />
          Library
        </h3>
        <TabBar tabs={SHELF_TABS} activeTab={activeShelf} onChange={setActiveShelf} />

        {shelfBooks.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={`No books ${activeShelf === 'reading' ? 'being read' : activeShelf === 'want' ? 'on your list' : 'completed yet'}`}
            description="Add a book to get started"
            action={{ label: 'Add Book', onClick: () => setShowAddBook(true) }}
          />
        ) : (
          <div className="space-y-3">
            {shelfBooks.map(book => {
              const progress = book.totalPages > 0 ? Math.round((book.pagesRead / book.totalPages) * 100) : 0;
              return (
                <GlassCard key={book.id} padding="p-4">
                  <div className="flex gap-3">
                    <BookCover category={book.category} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-medium text-white text-sm truncate">{book.title}</h4>
                          <p className="text-xs text-white/50">{book.author}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {activeShelf === 'want' && (
                            <button
                              onClick={() => moveToShelf(book.id, 'reading')}
                              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                              title="Start reading"
                            >
                              <BookOpen size={14} className="text-white/50" />
                            </button>
                          )}
                          {activeShelf === 'reading' && (
                            <button
                              onClick={() => moveToShelf(book.id, 'completed')}
                              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                              title="Mark completed"
                            >
                              <Check size={14} className="text-white/50" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteBook(book.id)}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                            title="Remove"
                          >
                            <Trash2 size={14} className="text-white/30 hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge color={CATEGORY_GRADIENTS[book.category]?.[0] || '#94a3b8'} variant="outlined">{book.category}</Badge>
                        <span className="text-xs text-white/30">{book.totalPages} pages</span>
                      </div>
                      {(activeShelf === 'reading' || activeShelf === 'completed') && (
                        <div className="mt-2">
                          <ProgressBar value={book.pagesRead} max={book.totalPages} color={ACCENT} height={4} />
                          <p className="text-xs text-white/40 mt-1">{book.pagesRead}/{book.totalPages} pages ({progress}%)</p>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Reading Log */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-white flex items-center gap-2">
            <Calendar size={18} style={{ color: ACCENT }} />
            Reading Log
          </h3>
          <button
            onClick={() => setShowLogSession(true)}
            className="text-xs font-medium transition-colors"
            style={{ color: ACCENT }}
          >
            + Log Session
          </button>
        </div>
        {recentLogs.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-4">No reading sessions logged yet</p>
        ) : (
          <div className="space-y-2">
            {recentLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
                    <BookOpen size={14} style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <p className="text-sm text-white/80">{log.bookTitle}</p>
                    <p className="text-xs text-white/40">{log.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{log.pages} pages</p>
                  {log.minutes > 0 && <p className="text-xs text-white/40">{log.minutes} min</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Add Book Modal */}
      {showAddBook && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddBook(false)}>
          <div className="glass-card w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-semibold text-white text-lg">Add Book</h3>
              <button onClick={() => setShowAddBook(false)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <X size={20} className="text-white/50" />
              </button>
            </div>
            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <label className="text-sm text-white/50 mb-1.5 block">Title</label>
                <input
                  type="text"
                  value={newBook.title}
                  onChange={e => setNewBook(prev => ({ ...prev, title: e.target.value }))}
                  className="glass-input text-sm"
                  placeholder="Book title"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-white/50 mb-1.5 block">Author</label>
                <input
                  type="text"
                  value={newBook.author}
                  onChange={e => setNewBook(prev => ({ ...prev, author: e.target.value }))}
                  className="glass-input text-sm"
                  placeholder="Author name"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-white/50 mb-1.5 block">Total Pages</label>
                  <input
                    type="number"
                    value={newBook.totalPages}
                    onChange={e => setNewBook(prev => ({ ...prev, totalPages: e.target.value }))}
                    className="glass-input text-sm"
                    placeholder="e.g. 320"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-white/50 mb-1.5 block">Category</label>
                  <select
                    value={newBook.category}
                    onChange={e => setNewBook(prev => ({ ...prev, category: e.target.value }))}
                    className="glass-input text-sm appearance-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddBook(false)} className="btn-ghost flex-1 text-sm">Cancel</button>
                <button type="submit" className="btn-primary flex-1 text-sm">Add Book</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Session Modal */}
      {showLogSession && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogSession(false)}>
          <div className="glass-card w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-semibold text-white text-lg">Log Reading Session</h3>
              <button onClick={() => setShowLogSession(false)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <X size={20} className="text-white/50" />
              </button>
            </div>
            <form onSubmit={handleLogSession} className="space-y-4">
              <div>
                <label className="text-sm text-white/50 mb-1.5 block">Book</label>
                <select
                  value={logEntry.bookId}
                  onChange={e => setLogEntry(prev => ({ ...prev, bookId: e.target.value }))}
                  className="glass-input text-sm appearance-none"
                  required
                >
                  <option value="" className="bg-slate-800">Select a book</option>
                  {currentlyReading.map(book => (
                    <option key={book.id} value={book.id} className="bg-slate-800">{book.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-white/50 mb-1.5 block">Pages Read</label>
                  <input
                    type="number"
                    value={logEntry.pages}
                    onChange={e => setLogEntry(prev => ({ ...prev, pages: e.target.value }))}
                    className="glass-input text-sm"
                    placeholder="e.g. 25"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-white/50 mb-1.5 block">Minutes</label>
                  <input
                    type="number"
                    value={logEntry.minutes}
                    onChange={e => setLogEntry(prev => ({ ...prev, minutes: e.target.value }))}
                    className="glass-input text-sm"
                    placeholder="e.g. 30"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-white/50 mb-1.5 block">Date</label>
                <input
                  type="date"
                  value={logEntry.date}
                  onChange={e => setLogEntry(prev => ({ ...prev, date: e.target.value }))}
                  className="glass-input text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowLogSession(false)} className="btn-ghost flex-1 text-sm">Cancel</button>
                <button type="submit" className="btn-primary flex-1 text-sm">Log Session</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <FloatingActionButton onClick={() => setShowAddBook(true)} icon={Plus} />
    </div>
  );
}
