import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Bookmark, Share2, ExternalLink, Clock,
  Filter, TrendingUp, ChevronRight, Tag, Search, Newspaper,
  RefreshCw, X, Loader2, AlertCircle, Zap
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import useLocalStorage from '../hooks/useLocalStorage';
import { useApp } from '../context/AppContext';
import { NAMESPACES, COLORS } from '../utils/constants';
import { getRelativeTime } from '../utils/dateHelpers';
import { generateNews } from '../utils/anthropicService';

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

const SIX_HOURS = 6 * 60 * 60 * 1000;

function ArticleCard({ article, isBookmarked, onToggleBookmark, onShare, onSelect, featured = false }) {
  const categoryColor = CATEGORY_COLORS[article.category] || COLORS.primary;

  if (featured) {
    return (
      <GlassCard padding="p-0" className="overflow-hidden">
        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}99)` }} />
        <div className="p-5 cursor-pointer" onClick={() => onSelect(article)}>
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
                onClick={(e) => { e.stopPropagation(); onToggleBookmark(article.id); }}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {isBookmarked ? (
                  <Bookmark size={18} style={{ color: categoryColor }} className="fill-current" />
                ) : (
                  <Bookmark size={18} className="text-white/40" />
                )}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onShare(article); }}
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
        <div className="flex-1 p-4 cursor-pointer" onClick={() => onSelect(article)}>
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
                onClick={(e) => { e.stopPropagation(); onToggleBookmark(article.id); }}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                {isBookmarked ? (
                  <Bookmark size={16} style={{ color: categoryColor }} className="fill-current" />
                ) : (
                  <Bookmark size={16} className="text-white/30" />
                )}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onShare(article); }}
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
  const { state } = useApp();
  const { settings } = state;
  const apiKey = settings.anthropicApiKey;

  const [articles, setArticles] = useLocalStorage(NAMESPACES.news, 'articles', []);
  const [lastFetch, setLastFetch] = useLocalStorage(NAMESPACES.news, 'lastFetch', 0);
  const [bookmarks, setBookmarks] = useLocalStorage(NAMESPACES.news, 'bookmarks', []);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchArticles = useCallback(async () => {
    if (!apiKey) return;
    setLoading(true);
    setError(null);
    try {
      const newArticles = await generateNews(apiKey);
      setArticles(newArticles);
      setLastFetch(Date.now());
    } catch (err) {
      setError(err.message || 'Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  }, [apiKey, setArticles, setLastFetch]);

  // Auto-fetch on mount if needed
  useEffect(() => {
    if (apiKey && (articles.length === 0 || Date.now() - lastFetch > SIX_HOURS)) {
      fetchArticles();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredArticles = useMemo(() => {
    let filtered = articles;
    if (activeCategory !== 'All') {
      filtered = filtered.filter(a => a.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [articles, activeCategory, searchQuery]);

  const featuredArticles = useMemo(() => {
    return filteredArticles.filter(a => a.featured);
  }, [filteredArticles]);

  const regularArticles = useMemo(() => {
    return filteredArticles.filter(a => !a.featured);
  }, [filteredArticles]);

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
        counts[cat] = articles.length;
      } else {
        counts[cat] = articles.filter(a => a.category === cat).length;
      }
    });
    return counts;
  }, [articles]);

  return (
    <div className="space-y-6 pb-4">
      <PageHeader
        title="News Feed"
        subtitle="Curated articles for your interests"
        rightElement={
          <div className="flex items-center gap-3">
            {apiKey && (
              <button
                onClick={fetchArticles}
                disabled={loading}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={`text-white/60 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <Bookmark size={16} className="text-white/40" />
              <span className="text-sm text-white/40">{bookmarkCount} saved</span>
            </div>
          </div>
        }
      />

      {/* No API Key Message */}
      {!apiKey && (
        <GlassCard className="text-center py-8">
          <Zap size={32} className="text-indigo-400 mx-auto mb-3" />
          <h3 className="text-white font-heading font-semibold mb-2">AI-Powered News</h3>
          <p className="text-sm text-white/50 max-w-sm mx-auto">
            Add your Anthropic API key in Settings &rarr; Integrations to get personalized AI-curated news
          </p>
        </GlassCard>
      )}

      {/* Error */}
      {error && (
        <GlassCard className="border border-red-500/20">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-red-400">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-white/40 hover:text-white/60">
              <X size={16} />
            </button>
          </div>
        </GlassCard>
      )}

      {/* Loading */}
      {loading && (
        <GlassCard className="text-center py-8">
          <Loader2 size={24} className="text-indigo-400 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-white/50">Generating personalized articles...</p>
        </GlassCard>
      )}

      {/* Search */}
      {articles.length > 0 && (
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
      )}

      {/* Category Filter Pills */}
      {articles.length > 0 && (
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
      )}

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-400" />
            Featured
          </h3>
          <div className="space-y-3">
            {featuredArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                isBookmarked={bookmarks.includes(article.id)}
                onToggleBookmark={toggleBookmark}
                onShare={handleShare}
                onSelect={setSelectedArticle}
                featured
              />
            ))}
          </div>
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
                onSelect={setSelectedArticle}
              />
            ))}
          </div>
        </div>
      ) : (
        !loading && articles.length > 0 && filteredArticles.length === 0 && (
          <EmptyState
            icon={Newspaper}
            title="No articles found"
            description={searchQuery ? `No articles match "${searchQuery}"` : `No articles in ${activeCategory} category`}
            action={{ label: 'View All', onClick: () => { setActiveCategory('All'); setSearchQuery(''); } }}
          />
        )
      )}

      {/* Article Detail Modal - Full Screen */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto"
          onClick={() => setSelectedArticle(null)}
        >
          <div className="min-h-full flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Close button */}
            <div className="flex justify-end p-4 sticky top-0 z-10">
              <button
                onClick={() => setSelectedArticle(null)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 max-w-2xl w-full mx-auto px-6 pb-12">
              <Badge color={CATEGORY_COLORS[selectedArticle.category]}>{selectedArticle.category}</Badge>
              <h1 className="text-2xl font-heading font-bold text-white mt-4 mb-4 leading-tight">
                {selectedArticle.title}
              </h1>
              <div className="flex items-center gap-3 text-sm text-white/40 mb-6">
                <span>{selectedArticle.source}</span>
                <span>|</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {getRelativeTime(selectedArticle.publishedAt)}
                </span>
              </div>
              <p className="text-base text-white/70 leading-relaxed whitespace-pre-line">
                {selectedArticle.summary}
              </p>
              <div className="flex flex-wrap gap-2 mt-6">
                {selectedArticle.tags?.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs"
                    style={{
                      background: `${CATEGORY_COLORS[selectedArticle.category] || COLORS.primary}15`,
                      color: `${CATEGORY_COLORS[selectedArticle.category] || COLORS.primary}cc`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
