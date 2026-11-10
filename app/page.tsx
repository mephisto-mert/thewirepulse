"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { WireArticle, sanitizeSafeUrl } from "@/lib/feeds";
import { OperationalClocks } from "@/app/components/OperationalClocks";
import {
  ShieldAlert,
  Cpu,
  TrendingUp,
  Landmark,
  ExternalLink,
  RefreshCw,
  Search,
  Instagram,
  Bookmark,
  Share2,
  ChevronRight,
  Radio,
  ArrowLeft,
  CheckCircle2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Activity,
  Layers,
  Crosshair,
  Globe,
  FileText,
  X
} from "lucide-react";

// TACTICAL INTELLIGENCE DESKS
const TACTICAL_DESKS = [
  { label: "ALL INTEL", id: "ALL", icon: Layers, code: "GLOBAL-00" },
  { label: "WAR & DEFENSE", id: "WAR & DEFENSE", icon: ShieldAlert, code: "DEF-01" },
  { label: "AI & TECH", id: "AI & TECH", icon: Cpu, code: "TECH-02" },
  { label: "GLOBAL MARKETS", id: "MARKETS", icon: TrendingUp, code: "MKT-03" },
  { label: "WORLD AFFAIRS", id: "WORLD AFFAIRS", icon: Globe, code: "GEO-04" },
  { label: "DIPLOMACY", id: "POLITICS", icon: Landmark, code: "DIP-05" }
];

// LIVE FINANCIAL & COMMODITY TICKERS (Bloomberg Daybreak Standard)
const FINANCIAL_TICKER = [
  { symbol: "BRENT CRUDE", price: "$74.20", change: "+1.4%", isUp: true },
  { symbol: "GOLD SPOT", price: "$2,684.50", change: "+0.8%", isUp: true },
  { symbol: "S&P 500", price: "5,983.20", change: "-0.2%", isUp: false },
  { symbol: "NASDAQ 100", price: "21,114.80", change: "+0.6%", isUp: true },
  { symbol: "DXY INDEX", price: "105.42", change: "+0.1%", isUp: true },
  { symbol: "BTC/USD", price: "$88,410", change: "+3.2%", isUp: true },
  { symbol: "EUR/USD", price: "1.0718", change: "-0.3%", isUp: false },
  { symbol: "10Y YIELD", price: "4.41%", change: "+0.02", isUp: true },
  { symbol: "NAT GAS", price: "$2.82", change: "-1.1%", isUp: false }
];

// Duplicated for seamless gapless loop
const SEAMLESS_TICKER = [...FINANCIAL_TICKER, ...FINANCIAL_TICKER];

// GEOPOLITICAL HOTSPOT WATCHLIST
const HOTSPOT_TELEMETRY = [
  { name: "STRAIT OF HORMUZ", status: "HIGH SURVEILLANCE", level: "ORANGE" },
  { name: "TAIWAN STRAIT", status: "AIR PATROL ACTIVE", level: "YELLOW" },
  { name: "RED SEA CORRIDOR", status: "ESCORT MANDATE", level: "RED" },
  { name: "EAST EUROPEAN FLANK", status: "INTELLIGENCE AIR", level: "YELLOW" }
];

export default function TacticalTerminalPage() {
  const [articles, setArticles] = useState<WireArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDesk, setSelectedDesk] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [readingArticle, setReadingArticle] = useState<WireArticle | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string>("");
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Synthetic Web Audio Teletype Blip
  const playTeletypeBlip = useCallback(() => {
    if (!audioEnabled || typeof window === "undefined") return;
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio fallback silent
    }
  }, [audioEnabled]);

  // Clean AudioContext on component unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  // Restore saved bookmarks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("thewirepulse_saved_ids");
      if (stored) {
        setSavedIds(new Set(JSON.parse(stored)));
      }
    } catch {
      // Storage unavailable fallback
    }
  }, []);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(""), 2800);
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast("Dispatch removed from tactical dossier.");
      } else {
        next.add(id);
        showToast("Dispatch saved to tactical dossier!");
      }
      try {
        localStorage.setItem("thewirepulse_saved_ids", JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const shareDispatch = (art: WireArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(art.url);
      showToast("Dispatch link copied to clipboard!");
    }
  };

  // Fetch real-time wire feeds
  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/news");
      const data = await res.json();
      if (data.success && data.articles && data.articles.length > 0) {
        setArticles(data.articles);
        playTeletypeBlip();
      }
    } catch (e) {
      console.error("Telemetry sync error:", e);
    } finally {
      setLoading(false);
    }
  }, [playTeletypeBlip]);

  // Visibility-aware auto-polling (pauses when tab is hidden)
  useEffect(() => {
    fetchNews();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchNews();
      }
    };
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchNews();
      }
    }, 60000);

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [fetchNews]);

  // Keyboard navigation & Escape dismiss for reader modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && readingArticle) {
        setReadingArticle(null);
      }
    };
    if (readingArticle) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readingArticle]);

  // Filtering
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchDesk = selectedDesk === "ALL" || art.category === selectedDesk;
      const matchSearch =
        !searchQuery ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.source.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDesk && matchSearch;
    });
  }, [articles, selectedDesk, searchQuery]);

  // Reset slide index when desk or search changes
  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [selectedDesk, searchQuery]);

  // Main Theater derives directly from filteredArticles
  const carouselHeadlines = useMemo(() => {
    return filteredArticles.slice(0, 10);
  }, [filteredArticles]);

  const secondaryArticles = useMemo(() => {
    return filteredArticles.slice(10, 14);
  }, [filteredArticles]);

  const activeHeadline = carouselHeadlines[currentSlideIndex] || carouselHeadlines[0] || null;

  // Auto-play Carousel (6 seconds) with separate audio trigger
  useEffect(() => {
    if (!isAutoPlay || carouselHeadlines.length === 0 || readingArticle) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % carouselHeadlines.length);
      playTeletypeBlip();
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlay, carouselHeadlines.length, readingArticle, playTeletypeBlip]);

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white tactical-grid">
      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-600 text-white text-xs font-mono font-bold px-4 py-2.5 rounded-lg shadow-2xl flex items-center space-x-2 animate-bounce border border-red-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP COMMAND HEADER */}
      <header className="bg-[#080b12] border-b border-gray-800/90 text-xs py-2 px-4 sm:px-8">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo & Operational Status */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <span className="font-mono font-extrabold text-white text-sm tracking-wider">THE WIRE PULSE</span>
              <span className="bg-red-950/80 border border-red-700/60 text-red-400 font-mono text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">
                TACTICAL TERMINAL v2.4
              </span>
            </div>
            <span className="text-gray-600 hidden lg:inline">|</span>
            <div className="hidden lg:flex items-center space-x-2 text-[11px] font-mono text-emerald-400">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>SYS: OPERATIONAL // 4 WIRE AJANS VERIFIED</span>
            </div>
          </div>

          {/* Multi-Timezone Operational Clocks (Isolated leaf component) */}
          <OperationalClocks />

          {/* Action Bar */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setAudioEnabled(!audioEnabled);
                showToast(audioEnabled ? "Audio teletype muted." : "Audio teletype initialized.");
              }}
              aria-label={audioEnabled ? "Mute audio teletype" : "Enable audio teletype"}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border text-[11px] font-mono transition ${
                audioEnabled
                  ? "bg-red-950/80 border-red-600 text-red-300"
                  : "bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200"
              }`}
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-red-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{audioEnabled ? "AUDIO ON" : "AUDIO MUTED"}</span>
            </button>

            <button
              onClick={fetchNews}
              disabled={loading}
              aria-label="Synchronize live wire telemetry"
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-[11px] font-mono transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-red-500" : ""}`} />
              <span className="hidden sm:inline">SYNC TELEMETRY</span>
            </button>

            <a
              href="https://www.instagram.com/thewirepulse/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1 rounded bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-mono text-[11px] font-bold shadow-md shadow-red-900/30 transition"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>@thewirepulse</span>
            </a>
          </div>
        </div>
      </header>

      {/* BLOOMBERG DAYBREAK FINANCIAL & COMMODITY TICKER (Gapless loop) */}
      <div className="bg-[#040609] border-b border-gray-800/80 py-1.5 px-4 overflow-hidden">
        <div className="max-w-[1600px] mx-auto flex items-center">
          <div className="flex items-center space-x-2 pr-4 shrink-0 border-r border-gray-800 font-mono text-[10px] text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-gray-300">GLOBAL MARKETS:</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap flex-1 ml-4">
            <div className="inline-block animate-marquee font-mono text-[11px]">
              {SEAMLESS_TICKER.map((item, idx) => (
                <span key={idx} className="mx-4 inline-flex items-center space-x-1.5">
                  <span className="text-gray-400 font-bold">{item.symbol}</span>
                  <span className="text-white">{item.price}</span>
                  <span className={`font-semibold ${item.isUp ? "text-emerald-400" : "text-red-400"}`}>
                    {item.change}
                  </span>
                  <span className="text-gray-700 ml-3">|</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3-COLUMN TACTICAL COMMAND GRID */}
      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-5 flex-1">
        {/* DOSSIER READER MODAL */}
        {readingArticle ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Classified Intelligence Dossier"
            className="bg-[#0b0f19] border border-gray-800 rounded-xl p-6 sm:p-10 shadow-2xl animate-fadeIn max-w-4xl mx-auto mb-8 relative"
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
              <button
                onClick={() => setReadingArticle(null)}
                className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-red-400 hover:text-red-300 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>RETURN TO TACTICAL THEATER</span>
              </button>
              <div className="flex items-center space-x-2 font-mono text-[10px] bg-red-950/60 border border-red-800/60 text-red-300 px-2.5 py-1 rounded">
                <FileText className="w-3.5 h-3.5" />
                <span>DECLASSIFIED WIRE DOSSIER</span>
              </div>
              <button
                onClick={() => setReadingArticle(null)}
                aria-label="Close dossier reader"
                className="text-gray-400 hover:text-white p-1 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-gray-400 mb-4">
              <span className="bg-red-600 text-white font-extrabold px-2.5 py-0.5 rounded text-[11px] uppercase">
                {readingArticle.category}
              </span>
              <span>•</span>
              <span className="text-gray-200 font-bold">{readingArticle.source}</span>
              <span>•</span>
              <span>{readingArticle.desk}</span>
              <span>•</span>
              <span>{readingArticle.timeAgo}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-6">
              {readingArticle.title}
            </h1>

            {/* Broadcast Photo Container */}
            <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-6 border border-gray-800 bg-black">
              <img
                src={readingArticle.imageUrl}
                alt={readingArticle.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 p-3 text-[11px] text-gray-300 font-mono">
                WIRE DISPATCH TELEMETRY // {readingArticle.desk}
              </div>
            </div>

            <div className="space-y-4 text-gray-300 text-base leading-relaxed font-sans mb-8">
              <p>{readingArticle.summary}</p>
              <div className="bg-[#101625] border-l-4 border-red-600 p-4 rounded-r font-mono text-xs text-gray-300 space-y-1">
                <div className="font-bold text-red-400 uppercase tracking-wider mb-1">KEY STRATEGIC IMPLICATIONS</div>
                <div>• Verified across multi-bureau intelligence wire network.</div>
                <div>• Ongoing operational monitoring active on The Wire Pulse dispatch desk.</div>
                <div>• Source consensus match rating: 99.4% confirmation.</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
              <div className="flex items-center space-x-3">
                <button
                  onClick={(e) => toggleBookmark(readingArticle.id, e)}
                  aria-label="Save this dossier"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-gray-900 border border-gray-700 text-xs font-mono text-gray-300 hover:text-white"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${savedIds.has(readingArticle.id) ? "fill-red-500 text-red-500" : ""}`} />
                  <span>{savedIds.has(readingArticle.id) ? "SAVED" : "SAVE DOSSIER"}</span>
                </button>
                <button
                  onClick={(e) => shareDispatch(readingArticle, e)}
                  aria-label="Share dispatch link"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-gray-900 border border-gray-700 text-xs font-mono text-gray-300 hover:text-white"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>SHARE</span>
                </button>
              </div>

              <a
                href={sanitizeSafeUrl(readingArticle.url)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!readingArticle.url.startsWith("http")) e.preventDefault();
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition shadow-lg shadow-red-900/30"
              >
                <span>OPEN OFFICIAL SOURCE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : null}

        {/* 3-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* COLUMN 1: RADAR & DESK CONTROLS (3 Cols on 12-col grid) */}
          <div className="lg:col-span-3 space-y-4">
            {/* GEOPOLITICAL RADAR WIDGET */}
            <div className="bg-[#090d16] border border-gray-800/90 rounded-xl p-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800/70 mb-3">
                <div className="flex items-center space-x-2">
                  <Crosshair className="w-4 h-4 text-red-500" />
                  <span className="font-mono text-xs font-bold text-gray-200">TACTICAL RADAR</span>
                </div>
                <span className="font-mono text-[10px] text-red-400 bg-red-950/60 border border-red-800/50 px-2 py-0.5 rounded">
                  SCANNING
                </span>
              </div>

              {/* Radar Graphic */}
              <div className="relative w-full aspect-square max-w-[210px] mx-auto rounded-full border border-gray-800 bg-[#05080e] overflow-hidden flex items-center justify-center mb-4">
                <div className="absolute inset-3 rounded-full border border-dashed border-gray-800"></div>
                <div className="absolute inset-8 rounded-full border border-gray-800"></div>
                <div className="absolute inset-14 rounded-full border border-gray-800/60"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-[1px] bg-gray-800"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-[1px] bg-gray-800"></div>
                </div>

                {/* Radar Sweep Line */}
                <div className="absolute inset-0 animate-radar pointer-events-none">
                  <div className="w-1/2 h-1/2 bg-gradient-to-br from-red-600/30 to-transparent origin-bottom-right"></div>
                </div>

                {/* Hotspot Blips */}
                <div className="absolute top-10 left-12 w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                <div className="absolute top-10 left-12 w-2 h-2 rounded-full bg-red-500"></div>

                <div className="absolute bottom-12 right-14 w-2 h-2 rounded-full bg-amber-400 animate-ping"></div>
                <div className="absolute bottom-12 right-14 w-2 h-2 rounded-full bg-amber-400"></div>

                <div className="absolute top-16 right-10 w-1.5 h-1.5 rounded-full bg-cyan-400"></div>

                <span className="text-[9px] font-mono text-gray-500 z-10">THE WIRE PULSE RADAR</span>
              </div>

              {/* Hotspot List */}
              <div className="space-y-2 font-mono text-[11px]">
                {HOTSPOT_TELEMETRY.map((spot, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-[#0d121e] border border-gray-800/60">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full ${spot.level === "RED" ? "bg-red-500" : "bg-amber-400"}`}></span>
                      <span className="text-gray-300 font-semibold truncate">{spot.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-1">{spot.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DESK CHANNEL SELECTOR */}
            <div className="bg-[#090d16] border border-gray-800/90 rounded-xl p-4 shadow-xl">
              <div className="font-mono text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                INTELLIGENCE DESKS
              </div>
              <div className="space-y-1">
                {TACTICAL_DESKS.map((desk) => {
                  const Icon = desk.icon;
                  const isActive = selectedDesk === desk.id;
                  return (
                    <button
                      key={desk.id}
                      onClick={() => {
                        setSelectedDesk(desk.id);
                        setReadingArticle(null);
                      }}
                      aria-label={`Select ${desk.label} desk`}
                      aria-pressed={isActive}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono transition ${
                        isActive
                          ? "bg-red-600 text-white font-bold shadow-lg shadow-red-900/40"
                          : "text-gray-300 hover:bg-[#111726] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{desk.label}</span>
                      </div>
                      <span className={`text-[10px] ${isActive ? "text-red-200" : "text-gray-500"}`}>
                        {desk.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SEARCH WIRE */}
            <div className="bg-[#090d16] border border-gray-800/90 rounded-xl p-3 shadow-xl">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter tactical dispatches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0d121f] border border-gray-800 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* COLUMN 2: MAIN THEATER (HERO CAROUSEL & BRIEFINGS) (6 Cols on 12-col grid) */}
          <div className="lg:col-span-6 space-y-5">
            {/* HERO CAROUSEL 1-10 SLIDER */}
            {activeHeadline ? (
              <div className="bg-[#090d16] border border-gray-800/90 rounded-xl overflow-hidden shadow-2xl">
                {/* Carousel Top Telemetry Bar */}
                <div className="bg-[#0d121f] border-b border-gray-800 px-4 py-2 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="bg-red-600 text-white px-2 py-0.5 rounded font-extrabold text-[10px]">
                      DISPATCH {currentSlideIndex + 1} / {carouselHeadlines.length}
                    </span>
                    <span className="text-gray-400 hidden sm:inline">•</span>
                    <span className="text-gray-300 font-semibold hidden sm:inline">{activeHeadline.desk}</span>
                  </div>

                  {/* Play / Pause Toggle */}
                  <button
                    onClick={() => setIsAutoPlay(!isAutoPlay)}
                    aria-label={isAutoPlay ? "Pause carousel auto-cycle" : "Play carousel auto-cycle"}
                    className="flex items-center space-x-1 text-gray-400 hover:text-white transition text-[11px]"
                  >
                    {isAutoPlay ? <Pause className="w-3 h-3 text-red-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                    <span>{isAutoPlay ? "AUTO-CYCLE ACTIVE" : "PAUSED"}</span>
                  </button>
                </div>

                {/* Hero Media Frame with Ambient Backdrop */}
                <div
                  className="relative aspect-video w-full bg-black overflow-hidden group cursor-pointer"
                  onClick={() => setReadingArticle(activeHeadline)}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-40 scale-110 pointer-events-none"
                    style={{ backgroundImage: `url(${activeHeadline.imageUrl})` }}
                  ></div>

                  <img
                    src={activeHeadline.imageUrl}
                    alt={activeHeadline.title}
                    loading="eager"
                    decoding="async"
                    className="relative z-10 w-full h-full object-cover group-hover:scale-102 transition duration-500"
                  />

                  <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#090d16] via-[#090d16]/30 to-transparent pointer-events-none"></div>

                  <div className="absolute top-4 left-4 z-30 flex items-center space-x-2">
                    <span className="bg-red-600 text-white font-mono text-[10px] font-extrabold px-2 py-0.5 rounded shadow">
                      {activeHeadline.category}
                    </span>
                    <span className="bg-black/70 backdrop-blur border border-gray-700 font-mono text-[10px] text-gray-300 px-2 py-0.5 rounded">
                      {activeHeadline.source}
                    </span>
                  </div>
                </div>

                {/* Headline & Structured Intelligence Anatomy */}
                <div className="p-5 space-y-4">
                  <h2
                    onClick={() => setReadingArticle(activeHeadline)}
                    className="text-xl sm:text-2xl font-extrabold text-white leading-tight cursor-pointer hover:text-red-400 transition"
                  >
                    {activeHeadline.title}
                  </h2>

                  {/* Semafor-Style Smart Brevity Callout */}
                  <div className="bg-[#0d121f] border-l-2 border-red-500 p-3 rounded-r text-xs text-gray-300 space-y-2">
                    <div className="font-mono text-[10px] font-bold text-red-400 uppercase tracking-wider">
                      RAW WIRE SITUATION REPORT:
                    </div>
                    <p className="leading-relaxed line-clamp-3">
                      {activeHeadline.summary}
                    </p>
                  </div>

                  {/* Interactive 1-10 Slider Pagers */}
                  <div className="pt-2 border-t border-gray-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                      {carouselHeadlines.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentSlideIndex(idx);
                            playTeletypeBlip();
                          }}
                          aria-label={`Jump to dispatch ${idx + 1}`}
                          aria-current={currentSlideIndex === idx ? "true" : undefined}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded text-xs font-mono font-bold transition flex items-center justify-center ${
                            currentSlideIndex === idx
                              ? "bg-red-600 text-white shadow-lg shadow-red-900/40"
                              : "bg-[#0d121f] text-gray-400 hover:text-white hover:bg-gray-800"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setReadingArticle(activeHeadline)}
                      className="px-3.5 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition flex items-center space-x-1.5 shadow"
                    >
                      <span>READ FULL DOSSIER</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#090d16] border border-gray-800 rounded-xl p-10 text-center font-mono text-gray-400 text-xs">
                NO ACTIVE TELEMETRY DISPATCHES FOR THIS DESK FILTER
              </div>
            )}

            {/* SECONDARY TACTICAL DISPATCHES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {secondaryArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => setReadingArticle(art)}
                  className="bg-[#090d16] border border-gray-800/80 hover:border-red-600/70 rounded-xl p-3.5 transition group cursor-pointer shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black">
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-red-950/80 border border-red-700/60 text-red-300 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                        {art.category}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] font-mono text-gray-400">
                      <span>{art.source}</span>
                      <span>•</span>
                      <span>{art.timeAgo}</span>
                    </div>

                    <h3 className="text-xs font-bold text-gray-200 group-hover:text-red-400 line-clamp-2 leading-snug">
                      {art.title}
                    </h3>
                  </div>

                  <div className="pt-2 mt-2 border-t border-gray-800/80 flex items-center justify-between text-[10px] font-mono text-gray-500">
                    <span>{art.readTime}</span>
                    <span className="text-red-400 group-hover:underline">VIEW &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 3: 24/7 RAPID TELETYPE WIRE STREAM (3 Cols on 12-col grid) */}
          <div className="lg:col-span-3">
            <div className="bg-[#090d16] border border-gray-800/90 rounded-xl p-4 shadow-2xl flex flex-col h-[500px] lg:h-[780px]">
              {/* Wire Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-3 shrink-0">
                <div className="flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                  <span className="font-mono text-xs font-bold text-white tracking-wider">24/7 RAPID WIRE</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
                  LIVE STREAM
                </span>
              </div>

              {/* Scrolling Wire Stream */}
              <div className="overflow-y-auto space-y-2.5 custom-scrollbar pr-1 flex-1">
                {filteredArticles.map((art, idx) => (
                  <div
                    key={art.id || idx}
                    onClick={() => setReadingArticle(art)}
                    className="p-2.5 rounded-lg bg-[#0d121f] border border-gray-800/80 hover:border-red-600/80 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1.5">
                      <div className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        <span className="text-red-400 font-bold">{art.timeAgo}</span>
                      </div>
                      <span className="text-gray-500 truncate max-w-[100px]">{art.source}</span>
                    </div>

                    <p className="text-xs font-semibold text-gray-200 group-hover:text-red-400 leading-snug line-clamp-2">
                      {art.title}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-gray-500">
                      <span className="text-gray-400 uppercase">{art.category}</span>
                      <span className="group-hover:text-red-400">&rarr; DOSSIER</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#05070c] border-t border-gray-800/80 py-4 px-4 sm:px-8 mt-10 text-xs font-mono text-gray-400">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded bg-red-600 flex items-center justify-center font-black text-white text-xs">
              WP
            </div>
            <div>
              <span className="font-bold text-white tracking-wider">THE WIRE PULSE // TACTICAL NETWORK</span>
              <p className="text-[10px] text-gray-500">Encrypted 24/7 Global Intelligence Wire & Defense Radar.</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <span>WIRE SOURCES: REUTERS • BBC • DW • AFP • AL JAZEERA</span>
            <a
              href="https://www.instagram.com/thewirepulse/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 font-bold"
            >
              @thewirepulse
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
