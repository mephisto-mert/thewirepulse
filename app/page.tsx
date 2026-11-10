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
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Radio, 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Eye, 
  Bell 
} from "lucide-react";

const CATEGORIES = [
  { label: "ALL DISPATCHES", id: "ALL", icon: Flame },
  { label: "WORLD AFFAIRS", id: "WORLD AFFAIRS", icon: Globe2 },
  { label: "WAR & DEFENSE", id: "WAR & DEFENSE", icon: ShieldAlert },
  { label: "GLOBAL MARKETS", id: "MARKETS", icon: TrendingUp },
  { label: "AI & TECHNOLOGY", id: "AI & TECH", icon: Cpu },
  { label: "DIPLOMACY & POLITICS", id: "POLITICS", icon: Landmark }
];

export default function WirePulsePortalPage() {
  const [articles, setArticles] = useState<WireArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState<number>(0);
  const [readingArticle, setReadingArticle] = useState<WireArticle | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2800);
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast("Removed from saved reading list.");
      } else {
        next.add(id);
        showToast("Saved to your reading list!");
      }
      return next;
    });
  };

  const shareArticle = (art: WireArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(art.url);
      showToast("Dispatch link copied to clipboard!");
    }
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/news");
      const data = await res.json();
      if (data.success && data.articles && data.articles.length > 0) {
        setArticles(data.articles);
      }
    } catch (e) {
      console.error("Error fetching wire feeds:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 60000); // 60s auto re-sync
    return () => clearInterval(interval);
  }, []);

  // Global Clock in UTC & Local
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        }) + " UTC"
      );
    };
    updateTime();
    const t = setInterval(updateTime, 1000);
    return () => clearInterval(t);
  }, []);

  // Filtered by Category and Search
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchCat = selectedCategory === "ALL" || art.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.source.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  // Top 10 Carousel Headlines
  const headlineList = useMemo(() => {
    return articles.slice(0, 10);
  }, [articles]);

  const activeHeadline = headlineList[currentHeadlineIndex] || headlineList[0] || null;

  // Auto-play Slider (Every 5 seconds)
  useEffect(() => {
    if (!isAutoPlay || headlineList.length === 0 || readingArticle) return;
    const timer = setInterval(() => {
      setCurrentHeadlineIndex((prev) => (prev + 1) % headlineList.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isAutoPlay, headlineList.length, readingArticle]);

  // Keyboard Navigation for Carousel (Left/Right Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readingArticle) return;
      if (e.key === "ArrowLeft") {
        setCurrentHeadlineIndex((prev) => (prev - 1 + headlineList.length) % headlineList.length);
      } else if (e.key === "ArrowRight") {
        setCurrentHeadlineIndex((prev) => (prev + 1) % headlineList.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [headlineList.length, readingArticle]);

  // Desk Segments
  const realtimeStream = useMemo(() => articles.slice(0, 18), [articles]);
  const topDevelopments = useMemo(() => articles.slice(10, 14), [articles]);
  const worldDispatches = useMemo(() => articles.filter((a) => a.category === "WORLD AFFAIRS").slice(0, 5), [articles]);
  const marketDispatches = useMemo(() => articles.filter((a) => a.category === "MARKETS").slice(0, 5), [articles]);
  const defenseDispatches = useMemo(() => articles.filter((a) => a.category === "WAR & DEFENSE").slice(0, 5), [articles]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-2xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP STREAMING TICKER */}
      <div className="bg-[#0b0e17] border-b border-gray-800 text-[11px] py-1.5 px-4 sm:px-8 flex items-center justify-between overflow-hidden">
        <div className="flex items-center space-x-3 shrink-0">
          <span className="flex items-center font-black tracking-wider text-red-500 uppercase bg-red-950/60 border border-red-800/40 px-2 py-0.5 rounded text-[10px]">
            <Radio className="w-3 h-3 mr-1 animate-pulse" />
            LIVE WIRE
          </span>
          <span className="text-gray-400 font-mono hidden md:inline">{currentTime}</span>
        </div>

        {/* Marquee ticker text */}
        <div className="overflow-hidden whitespace-nowrap mx-4 flex-1">
          <div className="inline-block animate-marquee text-gray-300">
            {articles.slice(0, 8).map((art, idx) => (
              <span 
                key={`ticker-${idx}`} 
                onClick={() => setReadingArticle(art)}
                className="cursor-pointer hover:text-red-400 transition mx-4"
              >
                <b className="text-red-500">[{art.category}]</b> {art.title} &nbsp;•&nbsp;
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <a
            href="https://www.instagram.com/thewirepulse/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center text-pink-400 hover:text-pink-300 transition text-[11px] font-semibold"
          >
            <Instagram className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">@thewirepulse</span>
          </a>
        </div>
      </div>

      {/* MAIN HEADER */}
      <header className="bg-[#0b0e14]/90 backdrop-blur-md border-b border-gray-800/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div 
            onClick={() => { setReadingArticle(null); setSelectedCategory("ALL"); }}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-black text-white text-base shadow-lg shadow-red-900/40 group-hover:scale-105 transition">
              WP
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-wider text-white">THE WIRE PULSE</span>
                <span className="bg-red-900/60 border border-red-700/50 text-red-400 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                  DISPATCH
                </span>
              </div>
              <p className="text-[10px] text-gray-400 tracking-wide font-mono">
                24/7 GLOBAL INTELLIGENCE & REALTIME TELETYPE NETWORK
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search global dispatches, topics, nations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121622] border border-gray-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
            />
          </div>

          {/* Action Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchNews}
              disabled={loading}
              className="flex items-center space-x-1.5 text-xs bg-gray-800/80 hover:bg-gray-700 border border-gray-700 px-3 py-1.5 rounded-lg text-gray-200 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-red-500" : ""}`} />
              <span className="hidden sm:inline">Refresh Feeds</span>
            </button>

            <a
              href="https://www.instagram.com/thewirepulse/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-1.5 rounded-lg shadow-md shadow-red-600/30 transition"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Watch Reels</span>
            </a>
          </div>
        </div>

        {/* NAVIGATION DESK TABS */}
        <div className="border-t border-gray-800/60 bg-[#080b11]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center space-x-1 overflow-x-auto no-scrollbar py-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setReadingArticle(null);
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition ${
                    isActive
                      ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* BODY CONTENT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
        {/* VIEW A: FULL-PAGE ARTICLE READER */}
        {readingArticle ? (
          <div className="max-w-4xl mx-auto bg-[#10141f] border border-gray-800 rounded-2xl p-6 sm:p-10 shadow-2xl animate-fadeIn">
            {/* Back Button */}
            <button
              onClick={() => setReadingArticle(null)}
              className="inline-flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-red-400 mb-6 transition group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
              <span>Back to Headline Carousel</span>
            </button>

            {/* Meta Pill Bar */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-mono mb-4">
              <span className="bg-red-600 text-white font-extrabold px-2.5 py-0.5 rounded text-[11px] uppercase tracking-wider">
                {readingArticle.category}
              </span>
              <span>•</span>
              <span className="text-gray-300 font-semibold">{readingArticle.source}</span>
              <span>•</span>
              <span>{readingArticle.timeAgo}</span>
              <span>•</span>
              <span>{readingArticle.readTime}</span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight mb-6">
              {readingArticle.title}
            </h1>

            {/* Hero Image */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-8 border border-gray-800 shadow-2xl bg-black">
              <img
                src={readingArticle.imageUrl}
                alt={readingArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 text-xs text-gray-300">
                <span>Photo: {readingArticle.desk} Archive / International News Agency Distribution</span>
              </div>
            </div>

            {/* Article Text & Key Context */}
            <div className="space-y-6 text-gray-200 text-base sm:text-lg leading-relaxed">
              <div className="p-4 bg-red-950/20 border-l-4 border-red-600 rounded-r text-gray-100 font-medium">
                {readingArticle.summary}
              </div>

              <p>
                International wire networks and field correspondents indicate that key diplomatic and operational personnel were mobilized swiftly as official inquiries continue. Regional observers evaluate these developments as a critical inflection point for multilateral stability.
              </p>

              <p>
                Independent security analysts and market strategists note that the diplomatic aftermath is expected to exert prolonged influence across cross-border trade, regulatory frameworks, and defense alignments.
              </p>

              {/* Wire Source Link */}
              <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-400 font-mono">
                  Verified Wire Source: <b className="text-white">{readingArticle.desk}</b>
                </div>

                <a
                  href={readingArticle.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg shadow-lg shadow-red-600/30 transition text-sm"
                >
                  <span>View Original Wire Dispatch</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Related Dispatches */}
            <div className="mt-12 pt-8 border-t border-gray-800">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2 mb-4">
                <Flame className="w-4 h-4 text-red-500" />
                <span>Related Breaking Dispatches</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {articles.filter((a) => a.id !== readingArticle.id).slice(0, 3).map((rel) => (
                  <div
                    key={`rel-${rel.id}`}
                    onClick={() => {
                      setReadingArticle(rel);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="bg-[#1a202c] border border-gray-800 rounded-lg p-3 hover:border-red-500 cursor-pointer transition group"
                  >
                    <div className="aspect-video w-full rounded overflow-hidden mb-2 bg-black">
                      <img src={rel.imageUrl} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    </div>
                    <span className="text-[10px] text-red-500 font-bold uppercase">{rel.category}</span>
                    <h4 className="text-xs font-bold text-gray-100 group-hover:text-red-400 line-clamp-2 mt-1">
                      {rel.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* VIEW B: MAIN BROADCAST DASHBOARD */
          <div className="space-y-10">
            {/* 1-10 HEADLINE SLIDER + REALTIME STREAM ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT 8 COLS: 1-10 HEADLINE CAROUSEL */}
              <div className="lg:col-span-8 bg-[#121622] border border-gray-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
                {activeHeadline ? (
                  <div 
                    className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden group cursor-pointer bg-black"
                    onClick={() => setReadingArticle(activeHeadline)}
                  >
                    <img
                      src={activeHeadline.imageUrl}
                      alt={activeHeadline.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 flex items-center space-x-2">
                      <span className="bg-red-600 text-white font-black text-xs px-3 py-1 rounded shadow-lg uppercase tracking-wider flex items-center">
                        <Flame className="w-3.5 h-3.5 mr-1" />
                        TOP STORY {currentHeadlineIndex + 1}
                      </span>
                      <span className="bg-black/60 backdrop-blur-md text-gray-300 font-mono text-xs px-2.5 py-1 rounded border border-gray-700">
                        {activeHeadline.source}
                      </span>
                    </div>

                    {/* Bottom Metadata & Title */}
                    <div className="absolute bottom-0 inset-x-0 p-5 sm:p-8">
                      <div className="flex items-center space-x-3 text-xs text-gray-300 mb-2 font-mono">
                        <span className="text-red-400 font-bold uppercase">{activeHeadline.category}</span>
                        <span>•</span>
                        <span>{activeHeadline.timeAgo}</span>
                      </div>

                      <h2 className="text-xl sm:text-3xl font-extrabold text-white leading-tight group-hover:text-red-400 transition mb-3 line-clamp-3">
                        {activeHeadline.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 font-normal hidden sm:block">
                        {activeHeadline.summary}
                      </p>

                      <div className="mt-4 flex items-center space-x-4">
                        <span className="inline-flex items-center text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition shadow">
                          Read Full Dispatch →
                        </span>
                      </div>
                    </div>

                    {/* Prev / Next Arrows */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentHeadlineIndex((prev) => (prev - 1 + headlineList.length) % headlineList.length);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-red-600 text-white p-2 rounded-full transition border border-gray-700 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentHeadlineIndex((prev) => (prev + 1) % headlineList.length);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-red-600 text-white p-2 rounded-full transition border border-gray-700 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center text-gray-500 font-mono text-sm">
                    Connecting to international wire feeds...
                  </div>
                )}

                {/* 1-10 NUMBERED PAGINATION BAR */}
                <div className="bg-[#0b0e14] border-t border-gray-800 p-2 sm:p-3 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
                  <div className="flex items-center space-x-1 sm:space-x-1.5 flex-1 justify-center">
                    {headlineList.map((_, idx) => (
                      <button
                        key={`num-btn-${idx}`}
                        onClick={() => setCurrentHeadlineIndex(idx)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-mono font-bold text-xs sm:text-sm flex items-center justify-center transition ${
                          currentHeadlineIndex === idx
                            ? "bg-red-600 text-white shadow-lg shadow-red-600/40 scale-105"
                            : "bg-[#181d2a] text-gray-400 hover:text-white hover:bg-gray-800"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsAutoPlay(!isAutoPlay)}
                    className="text-[10px] text-gray-400 hover:text-white px-2 py-1 bg-gray-800/60 rounded border border-gray-700 font-mono shrink-0 ml-2"
                  >
                    {isAutoPlay ? "Pause Auto" : "Play Auto"}
                  </button>
                </div>
              </div>

              {/* RIGHT 4 COLS: REALTIME WIRE STREAM */}
              <div className="lg:col-span-4 bg-[#121622] border border-gray-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[520px] sm:h-[590px]">
                {/* Header */}
                <div className="bg-[#0e121b] border-b border-gray-800 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                    <h3 className="font-extrabold text-xs sm:text-sm tracking-wide text-white uppercase">
                      REALTIME WIRE STREAM
                    </h3>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono uppercase">LIVE FEED</span>
                </div>

                {/* Stream Item List */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-800/80 custom-scrollbar p-1">
                  {realtimeStream.map((art, idx) => (
                    <div
                      key={`stream-${art.id}-${idx}`}
                      onClick={() => setReadingArticle(art)}
                      className="p-3 hover:bg-[#1c2230] cursor-pointer transition group"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="shrink-0 text-center">
                          <span className="inline-block bg-red-950/60 border border-red-800/50 text-red-400 font-mono text-[11px] font-bold px-1.5 py-0.5 rounded">
                            {art.timeAgo}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] text-gray-400 font-semibold uppercase">
                            {art.source} • <span className="text-red-400">{art.category}</span>
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-gray-200 group-hover:text-red-400 transition line-clamp-2 leading-snug mt-0.5">
                            {art.title}
                          </h4>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer status */}
                <div className="bg-[#0b0e14] px-4 py-2 text-[11px] text-gray-400 border-t border-gray-800 flex items-center justify-between">
                  <span>{articles.length} Verified Dispatches</span>
                  <span className="text-emerald-400 font-mono">● Auto-Sync Active</span>
                </div>
              </div>
            </div>

            {/* 4-COLUMN TOP DEVELOPMENTS GRID */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b-2 border-red-600 pb-2">
                <Flame className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-black uppercase tracking-wider text-white">
                  TOP DEVELOPMENTS & HIGHLIGHTS
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {topDevelopments.map((art) => (
                  <div
                    key={`top-${art.id}`}
                    onClick={() => setReadingArticle(art)}
                    className="bg-[#121622] border border-gray-800 hover:border-red-600 rounded-xl overflow-hidden shadow-lg hover:shadow-red-900/20 cursor-pointer transition group flex flex-col"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <span className="absolute top-2 left-2 bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                        {art.category}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono mb-2">
                          <span>{art.source}</span>
                          <span>{art.timeAgo}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition line-clamp-3 leading-snug">
                          {art.title}
                        </h4>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
                        <span className="text-red-500 font-semibold group-hover:underline">Read Dispatch →</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => toggleBookmark(art.id, e)}
                            className="p-1 hover:text-white"
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${savedIds.has(art.id) ? "text-amber-400 fill-amber-400" : ""}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3-COLUMN REGIONAL & EDITORIAL DESKS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* WORLD AFFAIRS */}
              <div className="bg-[#121622] border border-gray-800 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b-2 border-blue-600 pb-2">
                  <div className="flex items-center space-x-2">
                    <Globe2 className="w-4 h-4 text-blue-500" />
                    <h3 className="font-black text-sm uppercase text-white tracking-wide">WORLD AFFAIRS & DIPLOMACY</h3>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">GLOBAL DESK</span>
                </div>

                <div className="space-y-3">
                  {worldDispatches.map((art) => (
                    <div
                      key={`world-${art.id}`}
                      onClick={() => setReadingArticle(art)}
                      className="flex items-start space-x-3 p-2 rounded hover:bg-gray-800/50 cursor-pointer transition group"
                    >
                      <img src={art.imageUrl} alt={art.title} className="w-16 h-16 rounded object-cover shrink-0 bg-black" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-blue-400 font-bold uppercase">{art.source}</span>
                        <h4 className="text-xs font-bold text-gray-200 group-hover:text-blue-400 line-clamp-2 leading-snug">
                          {art.title}
                        </h4>
                        <span className="text-[10px] text-gray-500">{art.timeAgo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GLOBAL MARKETS */}
              <div className="bg-[#121622] border border-gray-800 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <h3 className="font-black text-sm uppercase text-white tracking-wide">GLOBAL MARKETS & TRADE</h3>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">FINANCIAL WIRE</span>
                </div>

                <div className="space-y-3">
                  {marketDispatches.map((art) => (
                    <div
                      key={`markets-${art.id}`}
                      onClick={() => setReadingArticle(art)}
                      className="flex items-start space-x-3 p-2 rounded hover:bg-gray-800/50 cursor-pointer transition group"
                    >
                      <img src={art.imageUrl} alt={art.title} className="w-16 h-16 rounded object-cover shrink-0 bg-black" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase">{art.source}</span>
                        <h4 className="text-xs font-bold text-gray-200 group-hover:text-emerald-400 line-clamp-2 leading-snug">
                          {art.title}
                        </h4>
                        <span className="text-[10px] text-gray-500">{art.timeAgo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* WAR & DEFENSE */}
              <div className="bg-[#121622] border border-gray-800 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b-2 border-red-600 pb-2">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    <h3 className="font-black text-sm uppercase text-white tracking-wide">DEFENSE & CONFLICT</h3>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">SECURITY WIRE</span>
                </div>

                <div className="space-y-3">
                  {defenseDispatches.map((art) => (
                    <div
                      key={`defense-${art.id}`}
                      onClick={() => setReadingArticle(art)}
                      className="flex items-start space-x-3 p-2 rounded hover:bg-gray-800/50 cursor-pointer transition group"
                    >
                      <img src={art.imageUrl} alt={art.title} className="w-16 h-16 rounded object-cover shrink-0 bg-black" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-red-400 font-bold uppercase">{art.source}</span>
                        <h4 className="text-xs font-bold text-gray-200 group-hover:text-red-400 line-clamp-2 leading-snug">
                          {art.title}
                        </h4>
                        <span className="text-[10px] text-gray-500">{art.timeAgo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#080a0f] border-t border-gray-800 py-8 px-4 sm:px-8 mt-12 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded bg-red-600 flex items-center justify-center font-black text-white text-xs">
              WP
            </div>
            <div>
              <span className="font-bold text-white tracking-wider">THE WIRE PULSE</span>
              <p className="text-[11px] text-gray-500">
                Independent 24/7 Global Intelligence & Real-Time Wire Network.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <span>Verified Feeds: Reuters, BBC News, DW, France 24, Al Jazeera</span>
            <a
              href="https://www.instagram.com/thewirepulse/"
              target="_blank"
              rel="noreferrer"
              className="text-pink-400 hover:text-pink-300 font-semibold"
            >
              Instagram @thewirepulse
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
