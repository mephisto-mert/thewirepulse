"use client";

import React, { useEffect, useState, useMemo } from "react";
import { WireArticle } from "@/lib/feeds";
import { 
  Globe2, 
  ShieldAlert, 
  Cpu, 
  TrendingUp, 
  Landmark, 
  ExternalLink, 
  RefreshCw, 
  Search, 
  Instagram,
  Clock,
  Bookmark,
  Share2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  X,
  Send,
  Zap,
  BookOpen
} from "lucide-react";

const CATEGORIES = [
  { label: "All Dispatches", icon: Globe2, value: "ALL" },
  { label: "War & Defense", icon: ShieldAlert, value: "WAR & DEFENSE" },
  { label: "AI & Innovation", icon: Cpu, value: "AI & TECH" },
  { label: "Markets & Economy", icon: TrendingUp, value: "MARKETS" },
  { label: "World Politics", icon: Landmark, value: "POLITICS" },
  { label: "Global Affairs", icon: Globe2, value: "WORLD AFFAIRS" },
];

export default function ModernPulsePage() {
  const [articles, setArticles] = useState<WireArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeArticle, setActiveArticle] = useState<WireArticle | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast("Removed from saved reading list");
      } else {
        next.add(id);
        showToast("Saved to your reading list");
      }
      return next;
    });
  };

  const shareArticle = (art: WireArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(art.url);
      showToast("Article dispatch link copied to clipboard!");
    }
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/news");
      const data = await res.json();
      if (data.success && data.articles) {
        setArticles(data.articles);
      }
    } catch (e) {
      console.error("Failed to fetch wire reports:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 60000); // 60s background revalidation
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) +
        " • " +
        now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) + " UTC"
      );
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchCat = selectedCategory === "ALL" || art.category === selectedCategory;
      const matchSearch =
        searchQuery === "" ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.desk.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  const leadStory = filteredArticles[0];
  const secondaryStories = filteredArticles.slice(1, 4);
  const feedStories = filteredArticles.slice(4);

  return (
    <div className="flex flex-col min-h-screen text-slate-100">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e2433] text-white text-xs px-4 py-3 rounded-xl border border-white/10 shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#ef233c]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Editorial Ticker & Market Pulse */}
      <div className="border-b border-white/[0.06] bg-[#0c0e14] py-2 px-4 sm:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-rose-500 font-semibold tracking-wide uppercase font-mono text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              Live Wire
            </span>
            <span className="text-white/20 hidden sm:inline">|</span>
            <span className="hidden md:inline font-mono text-[11px] text-slate-400">
              Verified Correspondents: London • Washington • Paris • Tokyo • Berlin
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <div className="hidden lg:flex items-center gap-3 text-slate-400">
              <span>BRENT <strong className="text-emerald-400">$74.20</strong></span>
              <span>•</span>
              <span>GOLD <strong className="text-amber-400">$2,740</strong></span>
              <span>•</span>
              <span>BTC <strong className="text-emerald-400">$91.4K</strong></span>
            </div>
            <span className="text-white/20 hidden lg:inline">|</span>
            <span>{currentTime || "GLOBAL DISPATCH"}</span>
          </div>
        </div>
      </div>

      {/* Main Masthead Header */}
      <header className="border-b border-white/[0.08] bg-[#090b10]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1b202e] to-[#0f121a] border border-rose-500/30 flex items-center justify-center text-rose-500 font-black text-xl shadow-lg shadow-rose-500/10">
              <Zap className="w-5 h-5 text-rose-500 fill-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
                  THE WIRE PULSE
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wider uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Global Wire
                </span>
              </div>
              <p className="text-xs text-slate-400 tracking-wider font-light mt-0.5">
                Real-time world intelligence, verified by international correspondents.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Live Search */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reports or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#131722] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/60 transition-all"
              />
            </div>

            {/* Instagram Follow */}
            <a
              href="https://www.instagram.com/thewirepulse/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-500 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:brightness-110 transition-all shadow-md shadow-rose-600/20 shrink-0"
            >
              <Instagram className="w-4 h-4" />
              <span className="hidden sm:inline">Follow on Instagram</span>
              <span className="sm:hidden">IG</span>
            </a>
          </div>
        </div>

        {/* Elegant Category Pills */}
        <div className="border-t border-white/[0.06] bg-[#0c0f16]/60 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4 py-2.5">
            <div className="flex items-center gap-1.5 shrink-0">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? "bg-white text-slate-950 font-semibold shadow-md shadow-white/10"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={fetchNews}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 shrink-0 font-mono"
              title="Refresh feed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-rose-500" : ""}`} />
              <span className="hidden lg:inline">Live Sync</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex-1 w-full space-y-10">
        {loading && articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4 text-slate-400">
            <RefreshCw className="w-9 h-9 animate-spin text-rose-500" />
            <p className="text-sm font-medium tracking-wide">Connecting to international wire networks...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-24 text-slate-400 glass-panel rounded-3xl p-12">
            <Globe2 className="w-12 h-12 mx-auto mb-3 text-slate-500" />
            <p className="text-lg font-semibold text-white">No reports match your current filter.</p>
            <p className="text-sm mt-1 text-slate-400">Try clearing the search query or selecting another category.</p>
          </div>
        ) : (
          <>
            {/* HERO & SECONDARY ASYMMETRICAL EDITORIAL GRID */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* PRIMARY LEAD STORY (7 cols) */}
              {leadStory && (
                <div 
                  onClick={() => setActiveArticle(leadStory)}
                  className="lg:col-span-7 bg-[#11141d] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl hover:border-rose-500/40 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative h-80 sm:h-96 w-full overflow-hidden bg-black">
                    <img
                      src={leadStory.imageUrl}
                      alt={leadStory.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#11141d] via-[#11141d]/20 to-transparent" />
                    
                    <div className="absolute top-5 left-5 flex gap-2">
                      <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-semibold tracking-wide uppercase shadow-lg shadow-rose-600/30">
                        {leadStory.category}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-slate-300 text-[11px] border border-white/10 font-mono">
                        {leadStory.desk}
                      </span>
                    </div>

                    <div className="absolute bottom-5 right-5 flex items-center gap-2">
                      <button
                        onClick={(e) => toggleBookmark(leadStory.id, e)}
                        className={`p-2.5 rounded-full backdrop-blur-md border transition-all ${
                          savedIds.has(leadStory.id)
                            ? "bg-rose-600 text-white border-rose-500"
                            : "bg-black/60 text-slate-300 border-white/10 hover:text-white"
                        }`}
                        title="Save for later"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        onClick={(e) => shareArticle(leadStory, e)}
                        className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white transition-all"
                        title="Share report"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-7 sm:p-9 space-y-4">
                    <div className="flex items-center gap-2.5 text-xs text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>{leadStory.timeAgo}</span>
                      <span>•</span>
                      <span>{leadStory.readTime}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">{leadStory.source}</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-editorial font-bold text-white leading-tight group-hover:text-rose-400 transition-colors">
                      {leadStory.title}
                    </h2>

                    <p className="text-slate-300 text-base leading-relaxed font-light">
                      {leadStory.summary}
                    </p>

                    <div className="pt-5 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-xs text-rose-400 font-semibold flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                        Read Correspondent Briefing <ArrowRight className="w-4 h-4" />
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        Published {new Date(leadStory.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECONDARY STORIES (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    DEVELOPING STORIES
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">Latest Hours</span>
                </div>

                <div className="space-y-4">
                  {secondaryStories.map((art) => (
                    <article
                      key={art.id}
                      onClick={() => setActiveArticle(art)}
                      className="bg-[#11141d] border border-white/[0.06] rounded-2xl p-4 sm:p-5 hover:border-white/20 transition-all duration-300 cursor-pointer group flex gap-4 items-center"
                    >
                      <div className="relative w-28 h-24 sm:w-32 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-black">
                        <img
                          src={art.imageUrl}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white text-[9px] font-mono">
                          {art.category.split(" ")[0]}
                        </span>
                      </div>

                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <span>{art.timeAgo}</span>
                          <span>•</span>
                          <span className="text-slate-500 truncate">{art.source}</span>
                        </div>

                        <h4 className="text-sm sm:text-base font-semibold text-white leading-snug group-hover:text-rose-400 transition-colors line-clamp-2">
                          {art.title}
                        </h4>

                        <p className="text-xs text-slate-400 line-clamp-1 font-light">
                          {art.summary}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Newsletter / Wire Brief Box */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-950/20 via-[#131722] to-[#11141d] border border-rose-500/20 space-y-3 mt-4">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wider font-mono">
                    <Send className="w-3.5 h-3.5" />
                    The 60-Second Wire Brief
                  </div>
                  <h4 className="text-base font-bold text-white">
                    Direct Intelligence in Your Pocket
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    Follow @thewirepulse on Instagram for rapid breaking coverage and visual analysis.
                  </p>
                  <a
                    href="https://www.instagram.com/thewirepulse/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-rose-600/20"
                  >
                    Follow @thewirepulse <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </section>

            {/* FULL WIRE FEED GRID */}
            <section className="space-y-6 pt-6">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight font-sans">
                    Chronological Wire Stream
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Continuous reporting stream across international desks ({filteredArticles.length} dispatches)
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <BookOpen className="w-3.5 h-3.5 text-rose-500" />
                  <span>Curated Feed</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedStories.map((art) => (
                  <article
                    key={art.id}
                    onClick={() => setActiveArticle(art)}
                    className="bg-[#11141d] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group shadow-xl"
                  >
                    <div>
                      <div className="relative h-48 w-full bg-black overflow-hidden">
                        <img
                          src={art.imageUrl}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                          loading="lazy"
                        />
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-semibold uppercase tracking-wider">
                            {art.category}
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-slate-300 text-[10px] font-mono">
                            {art.source}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-rose-500" />
                            <span>{art.timeAgo}</span>
                          </div>
                          <span>{art.readTime}</span>
                        </div>

                        <h4 className="text-base font-bold text-white leading-snug group-hover:text-rose-400 transition-colors line-clamp-2">
                          {art.title}
                        </h4>

                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-light">
                          {art.summary}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-white/[0.04] mt-4 flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono text-[11px] text-slate-500">{art.desk}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => toggleBookmark(art.id, e)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            savedIds.has(art.id) ? "text-rose-500" : "hover:text-white"
                          }`}
                          title="Bookmark"
                        >
                          <Bookmark className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={(e) => shareArticle(art, e)}
                          className="p-1.5 rounded-lg hover:text-white transition-colors"
                          title="Share"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* ARTICLE READER MODAL (Human Interactive Drawer) */}
      {activeArticle && (
        <div 
          onClick={() => setActiveArticle(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#11141d] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col"
          >
            {/* Modal Header Image */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-black shrink-0">
              <img
                src={activeArticle.imageUrl}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#11141d] via-[#11141d]/30 to-transparent" />
              
              <button
                onClick={() => setActiveArticle(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/70 backdrop-blur-md text-white hover:bg-rose-600 transition-colors border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-semibold uppercase">
                  {activeArticle.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-slate-300 text-xs font-mono">
                  {activeArticle.desk}
                </span>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                <span className="text-emerald-400 font-medium">Source: {activeArticle.source}</span>
                <span>•</span>
                <span>{activeArticle.timeAgo}</span>
                <span>•</span>
                <span>{activeArticle.readTime}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-white leading-tight">
                {activeArticle.title}
              </h2>

              <p className="text-slate-300 text-base leading-relaxed font-light">
                {activeArticle.summary}
              </p>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                <h5 className="text-xs font-mono text-rose-400 uppercase font-bold tracking-wider">
                  Correspondent Notes & Key Context
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This report has been cross-referenced through international wire networks. Follow-up dispatches will be published as official statements and on-the-ground developments unfold.
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => toggleBookmark(activeArticle.id, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-medium hover:bg-white/[0.05] transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{savedIds.has(activeArticle.id) ? "Saved" : "Save"}</span>
                  </button>
                  <button
                    onClick={(e) => shareArticle(activeArticle, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-medium hover:bg-white/[0.05] transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>

                <a
                  href={activeArticle.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-rose-600/30"
                >
                  View Full Wire Source <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#08090d] py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-bold text-white text-sm">THE WIRE PULSE</span>
              <span className="text-slate-600">•</span>
              <span>Autonomous Global Journalism Network</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Verified reporting aggregated from international visual wire feeds.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a href="https://www.instagram.com/thewirepulse/" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
              Instagram: @thewirepulse
            </a>
            <span>•</span>
            <span className="font-mono text-slate-500">Optimized for Vercel Edge</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
