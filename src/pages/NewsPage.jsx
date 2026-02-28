import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Bookmark, Share2, ExternalLink, Clock,
  TrendingUp, ChevronLeft, Tag, Search, Newspaper,
  RefreshCw, X, Loader2, AlertCircle, BookOpen
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import useLocalStorage from '../hooks/useLocalStorage';
import { NAMESPACES, COLORS } from '../utils/constants';
import { getRelativeTime } from '../utils/dateHelpers';
import { fetchAllNews } from '../utils/newsService';

const CATEGORY_COLORS = {
  All: COLORS.primary,
  'Talent Acquisition': COLORS.work,
  Singing: COLORS.vocals,
  'ЦСКА София': '#d32f2f',
  Tech: '#38bdf8',
};

const CATEGORIES = ['All', 'Talent Acquisition', 'Singing', 'ЦСКА София', 'Tech'];

const ONE_HOUR = 60 * 60 * 1000;

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
            {article.readingTime && (
              <span className="text-xs text-white/30 flex items-center gap-1 ml-auto">
                <BookOpen size={10} />
                {article.readingTime} min read
              </span>
            )}
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
                {article.readingTime && (
                  <span className="text-[10px] text-white/30 flex items-center gap-0.5">
                    <BookOpen size={9} />
                    {article.readingTime}m
                  </span>
                )}
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

function ArticleDetail({ article, isBookmarked, onToggleBookmark, onShare, onClose }) {
  const categoryColor = CATEGORY_COLORS[article.category] || COLORS.primary;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0f172a] overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-full" onClick={e => e.stopPropagation()}>
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-[#0f172a]/95 backdrop-blur-lg border-b border-white/5">
          <div className="flex items-center justify-between px-5 py-3 max-w-2xl mx-auto">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2">
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

        {/* Article Content */}
        <div className="max-w-2xl mx-auto px-5 pt-6 pb-16">
          {/* Category + Reading Time */}
          <div className="flex items-center gap-3 mb-4">
            <Badge color={categoryColor}>{article.category}</Badge>
            {article.readingTime && (
              <span className="text-xs text-white/40 flex items-center gap-1">
                <BookOpen size={12} />
                {article.readingTime} min read
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-heading font-bold text-white mb-4 leading-tight">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-3 text-sm text-white/40 mb-6 pb-6 border-b border-white/5">
            <span className="font-medium text-white/60">{article.source}</span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {getRelativeTime(article.publishedAt)}
            </span>
          </div>

          {/* Summary (highlighted) */}
          <div
            className="rounded-xl p-4 mb-6"
            style={{ background: `${categoryColor}10`, borderLeft: `3px solid ${categoryColor}` }}
          >
            <p className="text-sm text-white/70 leading-relaxed italic">
              {article.summary}
            </p>
          </div>

          {/* Full Content or Read More Link */}
          {article.content ? (
            <div className="prose prose-invert max-w-none">
              {article.content.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-[15px] text-white/70 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : article.url && article.url !== '#' ? (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              <ExternalLink size={16} />
              Read Full Article
            </a>
          ) : null}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/5">
            <Tag size={14} className="text-white/30" />
            {article.tags?.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs"
                style={{
                  background: `${categoryColor}15`,
                  color: `${categoryColor}cc`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewsPage() {
  const [articles, setArticles] = useLocalStorage(NAMESPACES.news, 'articles', []);
  const [lastFetch, setLastFetch] = useLocalStorage(NAMESPACES.news, 'lastFetch', 0);
  const [bookmarks, setBookmarks] = useLocalStorage(NAMESPACES.news, 'bookmarks', []);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const newArticles = await fetchAllNews();
      setArticles(newArticles);
      setLastFetch(Date.now());
    } catch (err) {
      setError(err.message || 'Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  }, [setArticles, setLastFetch]);

  // Auto-fetch on mount if stale (1 hour)
  useEffect(() => {
    if (articles.length === 0 || Date.now() - lastFetch > ONE_HOUR) {
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

  const lastUpdatedText = useMemo(() => {
    if (!lastFetch) return null;
    const diff = Date.now() - lastFetch;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Updated just now';
    if (mins < 60) return `Updated ${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Updated ${hours}h ago`;
    return `Updated ${Math.floor(hours / 24)}d ago`;
  }, [lastFetch]);

  // Show article detail as full page
  if (selectedArticle) {
    return (
      <ArticleDetail
        article={selectedArticle}
        isBookmarked={bookmarks.includes(selectedArticle.id)}
        onToggleBookmark={toggleBookmark}
        onShare={handleShare}
        onClose={() => setSelectedArticle(null)}
      />
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <PageHeader
        title="News Feed"
        subtitle="Curated articles for your interests"
        rightElement={
          <button
            onClick={fetchArticles}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/20 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={`text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-xs font-medium text-indigo-400">Refresh</span>
          </button>
        }
      />

      {/* Last Updated + Bookmark Count */}
      {articles.length > 0 && (
        <div className="flex items-center justify-between text-xs text-white/30 px-1">
          <span className="flex items-center gap-1.5">
            <Clock size={11} />
            {lastUpdatedText}
          </span>
          <span className="flex items-center gap-1.5">
            <Bookmark size={11} />
            {bookmarkCount} saved
          </span>
        </div>
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

      {/* Sticky Category Chips + Search */}
      {articles.length > 0 && (
        <div className="sticky top-0 z-30 -mx-5 px-5 pt-2 pb-3 bg-[#0f172a]/95 backdrop-blur-lg">
          {/* Search */}
          <div className="relative mb-3">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="glass-input text-sm pl-10"
            />
          </div>

          {/* Category Chips — Horizontal Scrollable */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map(cat => {
              const color = CATEGORY_COLORS[cat];
              const isActive = activeCategory === cat;
              const count = categoryCount[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive ? 'text-white shadow-lg' : 'text-white/50 hover:text-white/70'
                  }`}
                  style={{
                    background: isActive ? `${color}30` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isActive ? `${color}50` : 'rgba(255,255,255,0.06)'}`,
                    color: isActive ? color : undefined,
                    boxShadow: isActive ? `0 2px 12px ${color}20` : 'none',
                  }}
                >
                  {cat}
                  {count > 0 && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{
                        background: isActive ? `${color}30` : 'rgba(255,255,255,0.08)',
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
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
    </div>
  );
}
