"use client";

import React, { useEffect, useState, useMemo } from "react";
import { WireArticle } from "@/lib/feeds";
import { 
  Radio, 
  Flame, 
  Globe, 
  ShieldAlert, 
  Cpu, 
  TrendingUp, 
  Landmark, 
  ExternalLink, 
  RefreshCw, 
  Search, 
  Instagram,
  Clock,
  CheckCircle2
} from "lucide-react";

const CATEGORIES = [
  { label: "ALL DISPATCHES", icon: Globe, value: "ALL" },
  { label: "WAR & DEFENSE", icon: ShieldAlert, value: "WAR & DEFENSE" },
  { label: "AI & TECH", icon: Cpu, value: "AI & TECH" },
  { label: "MARKETS", icon: TrendingUp, value: "MARKETS" },
  { label: "POLITICS", icon: Landmark, value: "POLITICS" },
  { label: "WORLD AFFAIRS", icon: Globe, value: "WORLD AFFAIRS" },
];

export default function HomePage() {
  const [articles, setArticles] = useState<WireArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [lastRefreshed, setLastRefreshed] = useState<string>("Updating...");
  const [currentTime, setCurrentTime] = useState<string>("");

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/news");
      const data = await res.json();
      if (data.success && data.articles) {
        setArticles(data.articles);
        setLastRefreshed(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error("Failed to fetch news:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 45000); // 45s auto-refresh
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toUTCString().replace("GMT", "UTC"));
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
        art.source.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  const heroArticle = filteredArticles[0];
  const gridArticles = filteredArticles.slice(1);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Ticker & Status Bar */}
      <div className="bg-[#0f1218] border-b border-[#1f2430] text-xs font-mono py-2 px-4 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#ef233c] font-bold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef233c] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ef233c]"></span>
            </span>
            LIVE WIRE
          </span>
          <span className="hidden sm:inline text-[#8d99ae]">|</span>
          <span className="hidden sm:inline text-[#8d99ae]">24/7 AUTONOMOUS INTELLIGENCE DISPATCH</span>
        </div>

        <div className="flex items-center gap-4 text-[#8d99ae]">
          <span>{currentTime || "UTC MONITOR"}</span>
          <span>•</span>
          <button 
            onClick={fetchNews}
            className="flex items-center gap-1 hover:text-white transition-colors"
            title="Force refresh"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin text-[#ef233c]" : ""}`} />
            <span className="hidden md:inline">Synced {lastRefreshed}</span>
          </button>
        </div>
      </div>

      {/* Main Brand Header */}
      <header className="border-b border-[#1f2430] bg-[#0a0c10]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#12151c] border border-[#ef233c]/40 flex items-center justify-center font-mono font-black text-lg text-[#ef233c] shadow-lg shadow-[#ef233c]/10">
              WP
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wider text-white flex items-center gap-2">
                THE WIRE PULSE
                <span className="text-xs px-2 py-0.5 rounded bg-[#ef233c]/20 text-[#ef233c] border border-[#ef233c]/30 font-mono font-normal">
                  OFFICIAL WIRE
                </span>
              </h1>
              <p className="text-xs text-[#8d99ae] tracking-widest uppercase font-mono">
                Verified Breaking News & Geopolitical Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-[#8d99ae] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search wire reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#12151c] border border-[#1f2430] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#8d99ae] focus:outline-none focus:border-[#ef233c] transition-colors"
              />
            </div>

            {/* Instagram Social Follow Button */}
            <a
              href="https://www.instagram.com/thewirepulse/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-[#d90429] to-[#ef233c] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-md shadow-[#ef233c]/20 shrink-0"
            >
              <Instagram className="w-4 h-4" />
              <span>@thewirepulse</span>
            </a>
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="border-t border-[#1f2430] overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto px-4 flex gap-1 py-1.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-[#ef233c] text-white shadow-sm shadow-[#ef233c]/40"
                      : "text-[#8d99ae] hover:text-white hover:bg-[#12151c]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Breaking Marquee Ribbon */}
      {articles.length > 0 && (
        <div className="bg-[#12151c] border-b border-[#1f2430] py-2 px-4 overflow-hidden flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#ef233c] uppercase tracking-wider font-mono shrink-0">
            <Flame className="w-4 h-4" />
            <span>FLASH DISPATCH:</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap text-xs text-[#edf2f4]">
            <div className="inline-block animate-[marquee_30s_linear_infinite]">
              {articles.slice(0, 5).map((a, i) => (
                <span key={i} className="mr-8">
                  <span className="text-[#8d99ae] font-mono mr-2">[{a.source}]</span>
                  <a href={a.url} target="_blank" rel="noreferrer" className="hover:text-[#ef233c] transition-colors">
                    {a.title}
                  </a>
                  <span className="text-[#ef233c] ml-4">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {loading && articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-[#8d99ae]">
            <RefreshCw className="w-8 h-8 animate-spin text-[#ef233c]" />
            <p className="font-mono text-sm">Intercepting global wire dispatches...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20 text-[#8d99ae]">
            <Globe className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-base font-semibold text-white">No dispatches found in this category.</p>
            <p className="text-xs mt-1">Try another category or clear your search query.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* HERO STORY */}
            {heroArticle && (
              <section className="bg-[#12151c] border border-[#1f2430] rounded-xl overflow-hidden shadow-2xl hover:border-[#ef233c]/50 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0 group">
                <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto overflow-hidden bg-black">
                  <img
                    src={heroArticle.imageUrl}
                    alt={heroArticle.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12151c] via-transparent to-transparent lg:hidden" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-2.5 py-1 rounded bg-[#ef233c] text-white text-[11px] font-mono font-bold tracking-wider uppercase shadow-md">
                      {heroArticle.category}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-[#edf2f4] text-[11px] font-mono border border-white/10">
                      {heroArticle.source}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#8d99ae]">
                      <Clock className="w-3.5 h-3.5 text-[#ef233c]" />
                      <span>{heroArticle.timeAgo}</span>
                      <span>•</span>
                      <span className="text-[#2b9348] flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED WIRE
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white leading-snug group-hover:text-[#ef233c] transition-colors">
                      <a href={heroArticle.url} target="_blank" rel="noreferrer">
                        {heroArticle.title}
                      </a>
                    </h2>

                    <p className="text-sm text-[#8d99ae] leading-relaxed">
                      {heroArticle.summary}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#1f2430] flex items-center justify-between">
                    <span className="text-xs text-[#8d99ae] font-mono">
                      Published {new Date(heroArticle.publishedAt).toLocaleDateString()}
                    </span>
                    <a
                      href={heroArticle.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#ef233c] hover:text-white transition-colors"
                    >
                      READ FULL REPORT <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </section>
            )}

            {/* NEWS GRID */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1f2430] pb-3">
                <h3 className="text-sm font-mono font-bold tracking-wider text-white uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ef233c]" />
                  LATEST DISPATCHES ({filteredArticles.length})
                </h3>
                <span className="text-xs font-mono text-[#8d99ae]">AUTO-UPDATING FEED</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridArticles.map((art) => (
                  <article
                    key={art.id}
                    className="bg-[#12151c] border border-[#1f2430] rounded-xl overflow-hidden hover:border-[#ef233c]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col group shadow-lg"
                  >
                    <div className="relative h-48 bg-black overflow-hidden">
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#ef233c]/90 text-white text-[10px] font-mono font-bold tracking-wider uppercase">
                          {art.category}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[#8d99ae] text-[10px] font-mono">
                          {art.source}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8d99ae]">
                          <Clock className="w-3 h-3 text-[#ef233c]" />
                          <span>{art.timeAgo}</span>
                        </div>

                        <h4 className="text-base font-bold text-white leading-snug group-hover:text-[#ef233c] transition-colors">
                          <a href={art.url} target="_blank" rel="noreferrer">
                            {art.title}
                          </a>
                        </h4>

                        <p className="text-xs text-[#8d99ae] line-clamp-3 leading-relaxed">
                          {art.summary}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#1f2430]/60 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#8d99ae]">VERIFIED SOURCE</span>
                        <a
                          href={art.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-[#ef233c] hover:underline"
                        >
                          Details <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1f2430] bg-[#0f1218] py-8 text-xs font-mono text-[#8d99ae]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#ef233c] font-bold">THE WIRE PULSE</span>
            <span>•</span>
            <span>Realtime Global News Intelligence & RSS Wire Network</span>
          </div>

          <div className="flex items-center gap-4">
            <a href="https://www.instagram.com/thewirepulse/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              Instagram: @thewirepulse
            </a>
            <span>•</span>
            <span>Powered by Vercel Edge</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
