import { useState, useMemo } from 'react';
import {
  Bookmark, Share2, ExternalLink, Clock,
  Filter, TrendingUp, ChevronRight, Tag, Search, Newspaper
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import useLocalStorage from '../hooks/useLocalStorage';
import { NAMESPACES, COLORS } from '../utils/constants';
import { getRelativeTime } from '../utils/dateHelpers';

const CATEGORY_COLORS = {
  All: COLORS.primary,
  Sleep: COLORS.sleep,
  Fitness: COLORS.fitness,
  Finance: COLORS.finance,
  Music: '#f97316',
  Vocals: COLORS.vocals,
  Recruitment: COLORS.work,
  Tech: '#38bdf8',
};

const CATEGORIES = ['All', 'Sleep', 'Fitness', 'Finance', 'Music', 'Vocals', 'Recruitment', 'Tech'];

const MOCK_ARTICLES = [
  {
    id: 'art-1',
    title: 'Resistance Training May Improve Deep Sleep by 30%, Study Finds',
    summary: 'A new meta-analysis published in the British Journal of Sports Medicine shows that consistent resistance training increases slow-wave sleep duration by up to 30%, outperforming aerobic exercise alone. Researchers recommend 3 sessions per week for optimal results.',
    category: 'Sleep',
    tags: ['Research', 'Exercise', 'Deep Sleep'],
    source: 'Sleep Science Daily',
    publishedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    featured: true,
    url: '#',
  },
  {
    id: 'art-2',
    title: 'Screens-Off Before Bed: The 60-Minute Rule That Changes Everything',
    summary: 'Harvard researchers confirm that eliminating screen exposure 60 minutes before sleep increases melatonin production by 58%. The study tracked 1,200 participants over 8 weeks and found significant improvements in sleep onset latency.',
    category: 'Sleep',
    tags: ['Blue Light', 'Melatonin', 'Habits'],
    source: 'Harvard Health',
    publishedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    featured: false,
    url: '#',
  },
  {
    id: 'art-3',
    title: 'Habit Stacking: Building a Sleep Routine That Sticks',
    summary: 'Behavioral scientists recommend "stacking" new sleep habits onto existing routines. For example, after brushing your teeth (existing habit), do a 5-minute brain dump (new habit). This technique leverages neural pathways already in place.',
    category: 'Sleep',
    tags: ['Habits', 'Routine', 'Behavioral Science'],
    source: 'Atomic Habits Blog',
    publishedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    featured: false,
    url: '#',
  },
  {
    id: 'art-4',
    title: 'Resistance Bands vs. Free Weights: What the Evidence Actually Says',
    summary: 'A comprehensive review of 23 studies finds that resistance bands produce comparable muscle activation and strength gains to free weights for most muscle groups. Bands may even offer advantages for joint health and progressive overload in home settings.',
    category: 'Fitness',
    tags: ['Resistance Bands', 'Strength', 'Home Workout'],
    source: 'Journal of Strength & Conditioning',
    publishedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    featured: true,
    url: '#',
  },
  {
    id: 'art-5',
    title: 'The 20-Minute Workout: Why Short Sessions Are Just as Effective',
    summary: 'New research from the European Journal of Applied Physiology demonstrates that high-intensity 20-minute resistance sessions produce 90% of the hypertrophy stimulus of traditional 60-minute workouts, making them ideal for busy professionals.',
    category: 'Fitness',
    tags: ['Efficiency', 'HIIT', 'Time Management'],
    source: 'Fitness Science Weekly',
    publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    featured: false,
    url: '#',
  },
  {
    id: 'art-6',
    title: 'Best European Budgeting Apps in 2026: A Complete Comparison',
    summary: 'We tested 12 budgeting apps available in Europe, from YNAB to Revolut\'s built-in budgeting tools. For Bulgarian users, Revolut and Wallet by BudgetBakers emerged as top choices with multi-currency support and BGN compatibility.',
    category: 'Finance',
    tags: ['Apps', 'Europe', 'Budgeting'],
    source: 'European Finance Review',
    publishedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    featured: false,
    url: '#',
  },
  {
    id: 'art-7',
    title: 'The 50/30/20 Rule Needs an Update for 2026 Europe',
    summary: 'Financial advisors argue the classic 50/30/20 budgeting split needs regional adaptation. In cities like Sofia with lower cost of living, a 40/30/30 model may accelerate savings goals, especially for young professionals building an emergency fund.',
    category: 'Finance',
    tags: ['Budgeting', '50/30/20', 'Savings'],
    source: 'Personal Finance EU',
    publishedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    featured: false,
    url: '#',
  },
  {
    id: 'art-8',
    title: 'Automating Savings: Set It and Forget It Strategies That Work',
    summary: 'Behavioral economists have found that automated savings transfers on payday increase total savings by 40% compared to manual transfers. The key is removing friction: set up automated percentages, not fixed amounts.',
    category: 'Finance',
    tags: ['Automation', 'Savings', 'Psychology'],
    source: 'Investopedia',
    publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    featured: false,
    url: '#',
  },
  {
    id: 'art-9',
    title: 'Diaphragmatic Breathing: The Foundation Every Performer Needs',
    summary: 'Voice coaches and wind instrumentalists agree: diaphragmatic breathing is the single most important technique for performers. This guide covers exercises, common mistakes, and how to integrate breathing work into daily warm-ups for vocalists and musicians alike.',
    category: 'Music',
    tags: ['Breathing', 'Performance', 'Technique'],
    source: 'Musician\'s Health',
    publishedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    featured: false,
    url: '#',
  },
  {
    id: 'art-10',
    title: 'Building a Home Vocal Studio for Under $500',
    summary: 'You don\'t need a professional studio to practice effectively. With a Shure SM58 or Audio-Technica AT2020, some acoustic panels, and a simple DAW setup, you can create a practice space that rivals professional rehearsal rooms.',
    category: 'Music',
    tags: ['Home Studio', 'Gear', 'Budget'],
    source: 'Home Recording Magazine',
    publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    featured: false,
    url: '#',
  },
  {
    id: 'art-11',
    title: 'The SLS Resurgence: Why Speech Level Singing Is Making a Comeback',
    summary: 'After years of being overshadowed by newer vocal methods, SLS (Speech Level Singing) is experiencing a revival. Modern coaches are integrating Seth Riggs\' foundational principles with contemporary voice science, creating a more evidence-based approach.',
    category: 'Vocals',
    tags: ['SLS', 'Vocal Method', 'Training'],
    source: 'Voice Council Magazine',
    publishedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    featured: true,
    url: '#',
  },
  {
    id: 'art-12',
    title: 'Straw Phonation: The Science Behind the Most Effective Vocal Warm-Up',
    summary: 'Semi-occluded vocal tract exercises (SOVTEs) like straw phonation reduce vocal fold collision force by up to 40% while maintaining airflow. Speech pathologists now recommend straw exercises as the gold standard warm-up for both singers and speakers.',
    category: 'Vocals',
    tags: ['SOVTE', 'Warm-Up', 'Voice Science'],
    source: 'Journal of Voice',
    publishedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    featured: false,
    url: '#',
  },
  {
    id: 'art-13',
    title: 'Seth Riggs\' Legacy: How One Coach Shaped Modern Vocal Training',
    summary: 'From Michael Jackson to Stevie Wonder, Seth Riggs trained over 130 Grammy winners. His "Singing for the Stars" method emphasized bridging vocal registers without strain. A look at how his principles continue to influence vocal pedagogy worldwide.',
    category: 'Vocals',
    tags: ['Seth Riggs', 'Legacy', 'Vocal History'],
    source: 'Vocal Arts Journal',
    publishedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    featured: false,
    url: '#',
  },
  {
    id: 'art-14',
    title: 'AI Recruitment Tools in 2026: What Actually Works',
    summary: 'After the initial AI hiring hype, data shows which tools deliver real results. Structured interview platforms with AI-assisted scoring outperform resume screening bots. For talent acquisition specialists, the key is using AI to augment, not replace, human judgment.',
    category: 'Recruitment',
    tags: ['AI', 'Hiring Tech', 'Best Practices'],
    source: 'HR Technology Review',
    publishedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    featured: false,
    url: '#',
  },
  {
    id: 'art-15',
    title: 'The STAR Method Meets AI: Modernizing Competency-Based Interviews',
    summary: 'Talent acquisition teams are combining traditional STAR-format interviews with AI-powered analysis to improve hiring accuracy. New tools can identify competency patterns across candidate responses while maintaining the human element of behavioral interviewing.',
    category: 'Recruitment',
    tags: ['STAR Method', 'AI', 'Interviewing'],
    source: 'Talent Management Weekly',
    publishedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    featured: false,
    url: '#',
  },
  {
    id: 'art-16',
    title: 'Competency-Based Interviewing: The 2026 Playbook for Tech Hiring',
    summary: 'As tech companies shift away from algorithmic puzzles, competency-based interviewing is gaining ground. This approach, rooted in organizational psychology, predicts job performance more accurately and reduces bias in hiring decisions.',
    category: 'Recruitment',
    tags: ['Competency', 'Tech Hiring', 'Org Psych'],
    source: 'People Analytics Today',
    publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    featured: false,
    url: '#',
  },
  {
    id: 'art-17',
    title: 'PWA in 2026: Progressive Web Apps Are Finally Mainstream',
    summary: 'With improved iOS support and Project Fugu APIs, PWAs now match native app capabilities for most use cases. Companies report 40% lower development costs and 3x faster iteration cycles compared to maintaining separate native apps.',
    category: 'Tech',
    tags: ['PWA', 'Web Development', 'Mobile'],
    source: 'Web.dev Blog',
    publishedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    featured: false,
    url: '#',
  },
  {
    id: 'art-18',
    title: 'React 19 Ecosystem: Server Components, Actions, and What\'s Next',
    summary: 'The React ecosystem continues to evolve rapidly. Server Components are now production-ready, React Actions simplify form handling, and the new React Compiler eliminates the need for manual memoization in most cases.',
    category: 'Tech',
    tags: ['React', 'JavaScript', 'Frontend'],
    source: 'React Blog',
    publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    featured: false,
    url: '#',
  },
];

function ArticleCard({ article, isBookmarked, onToggleBookmark, onShare, featured = false }) {
  const categoryColor = CATEGORY_COLORS[article.category] || COLORS.primary;

  if (featured) {
    return (
      <GlassCard padding="p-0" className="overflow-hidden">
        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}99)` }} />
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Badge color={categoryColor}>{article.category}</Badge>
            <span className="text-xs text-white/30">Featured</span>
          </div>
          <h3 className="font-heading font-bold text-white text-lg mb-2 leading-tight">{article.title}</h3>
          <p className="text-sm text-white/60 leading-relaxed mb-4">{article.summary}</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-xs"
                style={{ background: `${categoryColor}15`, color: `${categoryColor}cc` }}
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">{article.source}</span>
              <span className="text-xs text-white/20">|</span>
              <span className="text-xs text-white/40 flex items-center gap-1">
                <Clock size={10} />
                {getRelativeTime(article.publishedAt)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onToggleBookmark(article.id)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {isBookmarked ? (
                  <Bookmark size={18} style={{ color: categoryColor }} className="fill-current" />
                ) : (
                  <Bookmark size={18} className="text-white/40" />
                )}
              </button>
              <button
                onClick={() => onShare(article)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Share2 size={18} className="text-white/40" />
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard padding="p-0" className="overflow-hidden">
      <div className="flex">
        <div className="w-1 flex-shrink-0" style={{ background: categoryColor }} />
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge color={categoryColor}>{article.category}</Badge>
              </div>
              <h4 className="font-medium text-white text-sm leading-tight mb-1.5">{article.title}</h4>
              <p className="text-xs text-white/50 leading-relaxed line-clamp-2 mb-2">{article.summary}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {article.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 rounded text-[10px]"
                    style={{ background: `${categoryColor}10`, color: `${categoryColor}aa` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/30">{article.source}</span>
                <span className="text-xs text-white/15">|</span>
                <span className="text-xs text-white/30 flex items-center gap-1">
                  <Clock size={9} />
                  {getRelativeTime(article.publishedAt)}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <button
                onClick={() => onToggleBookmark(article.id)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                {isBookmarked ? (
                  <Bookmark size={16} style={{ color: categoryColor }} className="fill-current" />
                ) : (
                  <Bookmark size={16} className="text-white/30" />
                )}
              </button>
              <button
                onClick={() => onShare(article)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Share2 size={16} className="text-white/30" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export default function NewsPage() {
  const [bookmarks, setBookmarks] = useLocalStorage(NAMESPACES.news, 'bookmarks', []);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = useMemo(() => {
    let articles = MOCK_ARTICLES;
    if (activeCategory !== 'All') {
      articles = articles.filter(a => a.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      articles = articles.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return articles;
  }, [activeCategory, searchQuery]);

  const featuredArticle = useMemo(() => {
    const featured = filteredArticles.find(a => a.featured);
    return featured || filteredArticles[0] || null;
  }, [filteredArticles]);

  const regularArticles = useMemo(() => {
    return filteredArticles.filter(a => a.id !== featuredArticle?.id);
  }, [filteredArticles, featuredArticle]);

  function toggleBookmark(articleId) {
    setBookmarks(prev => {
      if (prev.includes(articleId)) {
        return prev.filter(id => id !== articleId);
      }
      return [...prev, articleId];
    });
  }

  function handleShare(article) {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: article.url || window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${article.title}\n${article.summary}`).then(() => {
        const el = document.createElement('div');
        el.textContent = 'Copied to clipboard!';
        el.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 glass-card-sm px-4 py-2 text-sm text-white z-50';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2000);
      }).catch(() => {});
    }
  }

  const bookmarkCount = bookmarks.length;
  const categoryCount = useMemo(() => {
    const counts = {};
    CATEGORIES.forEach(cat => {
      if (cat === 'All') {
        counts[cat] = MOCK_ARTICLES.length;
      } else {
        counts[cat] = MOCK_ARTICLES.filter(a => a.category === cat).length;
      }
    });
    return counts;
  }, []);

  return (
    <div className="space-y-6 pb-4">
      <PageHeader
        title="News Feed"
        subtitle="Curated articles for your interests"
        rightElement={
          <div className="flex items-center gap-2">
            <Bookmark size={16} className="text-white/40" />
            <span className="text-sm text-white/40">{bookmarkCount} saved</span>
          </div>
        }
      />

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search articles..."
          className="glass-input text-sm pl-10"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map(cat => {
          const color = CATEGORY_COLORS[cat];
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                isActive ? 'text-white' : 'text-white/50 hover:text-white/70'
              }`}
              style={{
                background: isActive ? `${color}25` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isActive ? `${color}40` : 'rgba(255,255,255,0.06)'}`,
                color: isActive ? color : undefined,
              }}
            >
              {cat}
              <span className="text-xs opacity-60">{categoryCount[cat]}</span>
            </button>
          );
        })}
      </div>

      {/* Featured Article */}
      {featuredArticle && (
        <div>
          <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-400" />
            Featured
          </h3>
          <ArticleCard
            article={featuredArticle}
            isBookmarked={bookmarks.includes(featuredArticle.id)}
            onToggleBookmark={toggleBookmark}
            onShare={handleShare}
            featured
          />
        </div>
      )}

      {/* Article List */}
      {regularArticles.length > 0 ? (
        <div>
          <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
            <Newspaper size={16} className="text-white/40" />
            Latest Articles
            <span className="text-xs text-white/30 font-normal">({regularArticles.length})</span>
          </h3>
          <div className="space-y-3">
            {regularArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                isBookmarked={bookmarks.includes(article.id)}
                onToggleBookmark={toggleBookmark}
                onShare={handleShare}
              />
            ))}
          </div>
        </div>
      ) : (
        filteredArticles.length === 0 && (
          <EmptyState
            icon={Newspaper}
            title="No articles found"
            description={searchQuery ? `No articles match "${searchQuery}"` : `No articles in ${activeCategory} category`}
            action={{ label: 'View All', onClick: () => { setActiveCategory('All'); setSearchQuery(''); } }}
          />
        )
      )}
    </div>
  );
}
