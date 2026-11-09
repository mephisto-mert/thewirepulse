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
  { label: "TÜM HABERLER", en: "ALL", icon: Flame },
  { label: "DÜNYA & GÜNDEM", en: "WORLD AFFAIRS", icon: Globe2 },
  { label: "SAVUNMA & ÇATIŞMA", en: "WAR & DEFENSE", icon: ShieldAlert },
  { label: "EKONOMİ & PİYASALAR", en: "MARKETS", icon: TrendingUp },
  { label: "TEKNOLOJİ & AI", en: "AI & TECH", icon: Cpu },
  { label: "POLİTİKA & DİPLOMASİ", en: "POLITICS", icon: Landmark }
];

export default function SonDakikaPulsePage() {
  const [articles, setArticles] = useState<WireArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentMansetIndex, setCurrentMansetIndex] = useState<number>(0);
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
        showToast("Haber okuma listesinden kaldırıldı.");
      } else {
        next.add(id);
        showToast("Haber okuma listenize kaydedildi!");
      }
      return next;
    });
  };

  const shareArticle = (art: WireArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(art.url);
      showToast("Haber bağlantısı panoya kopyalandı!");
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
      console.error("Haberler çekilirken hata oluştu:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 60000); // 60s otomatik canlı ajans güncellemesi
    return () => clearInterval(interval);
  }, []);

  // Canlı Saat
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: "long", 
        year: "numeric", 
        month: "long", 
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      };
      setCurrentTime(now.toLocaleDateString("tr-TR", options));
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    let result = articles;
    if (selectedCategory !== "ALL") {
      result = result.filter((a) => a.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q)
      );
    }
    return result;
  }, [articles, selectedCategory, searchQuery]);

  // Manşet listesi (Top 10)
  const mansetList = useMemo(() => {
    return articles.slice(0, 10);
  }, [articles]);

  useEffect(() => {
    if (readingArticle) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [readingArticle]);

  // Manşet Otomatik Döngü

  useEffect(() => {
    if (!isAutoPlay || mansetList.length === 0 || readingArticle) return;
    const timer = setInterval(() => {
      setCurrentMansetIndex((prev) => (prev + 1) % mansetList.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlay, mansetList.length, readingArticle]);

  // Son dakika akışı (Chronological wire for right column)
  const sonDakikaAkisi = useMemo(() => {
    return articles.slice(0, 18);
  }, [articles]);

  // Sürmanşetler (4 adet)
  const surmansetler = useMemo(() => {
    return articles.slice(10, 14);
  }, [articles]);

  // Kategori blokları
  const dunyaHaberleri = useMemo(() => {
    return articles.filter(a => a.category === "WORLD AFFAIRS" || a.category === "POLITICS").slice(0, 4);
  }, [articles]);

  const ekonomiHaberleri = useMemo(() => {
    return articles.filter(a => a.category === "MARKETS").slice(0, 4);
  }, [articles]);

  const savunmaHaberleri = useMemo(() => {
    return articles.filter(a => a.category === "WAR & DEFENSE").slice(0, 4);
  }, [articles]);

  const activeManset = mansetList[currentMansetIndex] || articles[0];

  return (
    <div className="min-h-screen bg-[#0d0f15] text-[#f1f5f9] flex flex-col antialiased selection:bg-red-600 selection:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-600 text-white font-medium px-5 py-3 rounded-lg shadow-2xl shadow-red-900/50 flex items-center space-x-2 border border-red-400">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOPBAR: Canlı Finans & Saat & Sosyal */}
      <div className="bg-[#08090d] border-b border-gray-800 text-xs font-mono text-gray-400 py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-red-500 font-bold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-fast mr-1.5"></span>
              CANLI YAYIN
            </span>
            <span className="hidden md:inline-block text-gray-400">
              <Calendar className="w-3.5 h-3.5 inline mr-1 text-gray-500" />
              {currentTime || "9 Kasım 2026 Pazartesi"}
            </span>
          </div>

          {/* Piyasa Bant Göstergeleri */}
          <div className="hidden lg:flex items-center space-x-5 text-gray-300">
            <span className="hover:text-white transition">USD/TRY: <b className="text-emerald-400">35.84 ▲</b></span>
            <span className="hover:text-white transition">EUR/TRY: <b className="text-emerald-400">38.62 ▲</b></span>
            <span className="hover:text-white transition">ALTIN: <b className="text-amber-400">3.125 TL ▲</b></span>
            <span className="hover:text-white transition">BRENT: <b className="text-rose-400">74.2$ ▼</b></span>
            <span className="hover:text-white transition">BITCOIN: <b className="text-emerald-400">$91,420 ▲</b></span>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="https://www.instagram.com/thewirepulse/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 text-gray-300 hover:text-white bg-gradient-to-r from-pink-600/30 to-purple-600/30 hover:from-pink-600/50 hover:to-purple-600/50 border border-pink-500/40 px-2.5 py-0.5 rounded transition text-[11px]"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-400" />
              <span>@thewirepulse</span>
            </a>
          </div>
        </div>
      </div>

      {/* HEADER: Logo & Slogan & Arama */}
      <header className="bg-[#121620] border-b border-gray-800 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Logo */}
            <div className="flex items-center justify-between">
              <button 
                onClick={() => { setReadingArticle(null); setSelectedCategory("ALL"); }}
                className="text-left group flex items-center space-x-3"
              >
                <div className="w-10 h-10 rounded bg-red-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-red-600/30 group-hover:scale-105 transition">
                  WP
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-black tracking-tight text-white uppercase group-hover:text-red-500 transition">
                      THE WIRE PULSE
                    </span>
                    <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded tracking-widest uppercase animate-pulse-fast">
                      SON DAKİKA
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">
                    Küresel 7/24 Anlık Ajans Haberleri & Canlı İstihbarat Portalı
                  </p>
                </div>
              </button>

              <button
                onClick={fetchNews}
                disabled={loading}
                className="md:hidden p-2 text-gray-400 hover:text-white bg-gray-800/80 rounded"
                title="Yenile"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-red-500" : ""}`} />
              </button>
            </div>

            {/* Arama & Yenile Butonu */}
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Son dakika haberlerinde ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1a202c] border border-gray-700/80 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm text-white pl-9 pr-3 py-2 rounded outline-none transition placeholder-gray-500"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs bg-gray-700 rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                onClick={fetchNews}
                disabled={loading}
                className="hidden md:flex items-center space-x-1.5 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3 py-2 rounded transition active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-red-500 ${loading ? "animate-spin" : ""}`} />
                <span>{loading ? "Taranıyor..." : "Canlı Yenile"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* KIRMIZI SON DAKİKA KAYAN YAZI BANDI (Breaking News Ticker) */}
        <div className="bg-[#b91c1c] text-white overflow-hidden py-1 px-4 flex items-center shadow-inner">
          <div className="flex items-center bg-black/30 font-black text-xs px-2.5 py-0.5 rounded mr-3 tracking-wider shrink-0 uppercase">
            <Radio className="w-3.5 h-3.5 mr-1 text-white animate-pulse-fast" />
            FLAŞ HABER
          </div>
          <div className="relative w-full overflow-hidden whitespace-nowrap">
            <div className="animate-marquee flex items-center space-x-10 text-xs font-medium">
              {articles.slice(0, 10).map((art, idx) => (
                <button
                  key={`marquee-${art.id}-${idx}`}
                  onClick={() => setReadingArticle(art)}
                  className="hover:underline flex items-center space-x-2 text-white/95"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white/70"></span>
                  <span className="font-bold">[{art.source}]:</span>
                  <span>{art.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KATEGORİ MENÜSÜ (Haber Portalı Sekmeleri) */}
        <nav className="bg-[#0b0e14] border-t border-b border-gray-800/80 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-center overflow-x-auto space-x-1 py-1.5 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.en;
              return (
                <button
                  key={cat.en}
                  onClick={() => {
                    setSelectedCategory(cat.en);
                    setReadingArticle(null);
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold transition whitespace-nowrap uppercase tracking-wide ${
                    isActive
                      ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-red-500"}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* ANA İÇERİK ALANI */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-6">
        {/* ========================================================
            DEDICATED FULL ARTICLE READING VIEW (NO POPUP MODAL!)
        ======================================================== */}
        {readingArticle ? (
          <div className="bg-[#131722] border border-gray-800 rounded-xl p-6 sm:p-10 shadow-2xl max-w-4xl mx-auto animate-fadeIn">
            {/* Geri Dön Butonu & Üst Eylemler */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-800">
              <button
                onClick={() => setReadingArticle(null)}
                className="flex items-center space-x-2 text-sm font-bold text-gray-300 hover:text-white bg-gray-800 hover:bg-red-600 px-4 py-2 rounded-lg transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Son Dakika Akışına Dön</span>
              </button>

              <div className="flex items-center space-x-3">
                <button
                  onClick={(e) => toggleBookmark(readingArticle.id, e)}
                  className={`p-2.5 rounded-lg border text-sm transition ${
                    savedIds.has(readingArticle.id)
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-gray-800 text-gray-400 border-gray-700 hover:text-white"
                  }`}
                  title="Haberi Kaydet"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => shareArticle(readingArticle, e)}
                  className="p-2.5 rounded-lg bg-gray-800 text-gray-400 border border-gray-700 hover:text-white transition"
                  title="Paylaş"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Kategori & Tarih Bilgisi */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-4 font-mono">
              <span className="bg-red-600 text-white font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                {readingArticle.category}
              </span>
              <span className="text-gray-300 font-semibold">Kaynak: {readingArticle.source}</span>
              <span>•</span>
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-red-500" />
                {readingArticle.timeAgo}
              </span>
              <span>•</span>
              <span>Okunma Süresi: {readingArticle.readTime}</span>
            </div>

            {/* Büyük Haber Başlığı */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight mb-6">
              {readingArticle.title}
            </h1>

            {/* Büyük Manşet Görseli */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-8 border border-gray-800 shadow-2xl bg-black">
              <img
                src={readingArticle.imageUrl}
                alt={readingArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 text-xs text-gray-300">
                <span>Fotoğraf: {readingArticle.desk} Arşivi / Uluslararası Haber Ajansı Dağıtımı</span>
              </div>
            </div>

            {/* Haber Metni & Detayları */}
            <div className="space-y-6 text-gray-200 text-base sm:text-lg leading-relaxed">
              <div className="p-4 bg-red-950/20 border-l-4 border-red-600 rounded-r text-gray-100 font-medium">
                {readingArticle.summary}
              </div>

              <p>
                Uluslararası haber ajansları ve saha muhabirleri tarafından bildirilen son dakika raporuna göre, yaşanan gelişmeler küresel diplomasi ve bölgesel istikrarda kritik bir kırılma noktasına işaret ediyor. İlgili bürolardan aktarılan bilgilere göre konuyla ilgili tarafların temasları devam ediyor.
              </p>

              <p>
                Analistler ve bölge uzmanları, bu son dakika gelişmesinin piyasalar, savunma paktları ve uluslararası ilişkiler üzerinde uzun vadeli yansımaları olacağını değerlendiriyor.
              </p>

              {/* Dış Ajans Kaynağı Butonu */}
              <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-400 font-mono">
                  Doğrulanmış Ajans Bülteni: <b className="text-white">{readingArticle.desk}</b>
                </div>

                <a
                  href={readingArticle.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg shadow-lg shadow-red-600/30 transition text-sm"
                >
                  <span>Ajansın Orijinal Haberine Git</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* İlgili Son Dakika Haberleri Kuşağı */}
            <div className="mt-12 pt-8 border-t border-gray-800">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2 mb-4">
                <Flame className="w-4 h-4 text-red-500" />
                <span>Gündemdeki Diğer Son Dakika Gelişmeleri</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {articles.filter(a => a.id !== readingArticle.id).slice(0, 3).map((rel) => (
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
          /* ========================================================
              STANDART HABER PORTALI VİTRİNİ (Manşet Slider + Akış)
          ======================================================== */
          <div className="space-y-10">
            {/* MANŞET VE SAĞ CANLI AKIŞ BLOKU */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* SOL KOLON: 1-10 MANŞET SLIDER (8 Kolon) */}
              <div className="lg:col-span-8 bg-[#121622] border border-gray-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
                {activeManset ? (
                  <div 
                    className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden group cursor-pointer bg-black"
                    onClick={() => setReadingArticle(activeManset)}
                  >
                    <img
                      src={activeManset.imageUrl}
                      alt={activeManset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                    {/* Üst Rozetler */}
                    <div className="absolute top-4 left-4 flex items-center space-x-2">
                      <span className="bg-red-600 text-white font-black text-xs px-3 py-1 rounded shadow-lg uppercase tracking-wider flex items-center">
                        <Flame className="w-3.5 h-3.5 mr-1" />
                        MANŞET {currentMansetIndex + 1}
                      </span>
                      <span className="bg-black/60 backdrop-blur-md text-gray-300 font-mono text-xs px-2.5 py-1 rounded border border-gray-700">
                        {activeManset.source}
                      </span>
                    </div>

                    {/* Alt Metin Alanı */}
                    <div className="absolute bottom-0 inset-x-0 p-5 sm:p-8">
                      <div className="flex items-center space-x-3 text-xs text-gray-300 mb-2 font-mono">
                        <span className="text-red-400 font-bold uppercase">{activeManset.category}</span>
                        <span>•</span>
                        <span>{activeManset.timeAgo}</span>
                      </div>

                      <h2 className="text-xl sm:text-3xl font-extrabold text-white leading-tight group-hover:text-red-400 transition mb-3 line-clamp-3">
                        {activeManset.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 font-normal hidden sm:block">
                        {activeManset.summary}
                      </p>

                      <div className="mt-4 flex items-center space-x-4">
                        <span className="inline-flex items-center text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition shadow">
                          Haberin Detayını Oku →
                        </span>
                      </div>
                    </div>

                    {/* Sol / Sağ Oklar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentMansetIndex((prev) => (prev - 1 + mansetList.length) % mansetList.length);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-red-600 text-white p-2 rounded-full transition border border-gray-700 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentMansetIndex((prev) => (prev + 1) % mansetList.length);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-red-600 text-white p-2 rounded-full transition border border-gray-700 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center text-gray-500 font-mono text-sm">
                    Haber bülteni yükleniyor...
                  </div>
                )}

                {/* 1'den 10'a MANŞET NUMARALARI ÇUBUĞU */}
                <div className="bg-[#0b0e14] border-t border-gray-800 p-2 flex items-center justify-between overflow-x-auto">
                  <div className="flex items-center space-x-1.5 w-full justify-between px-1">
                    {mansetList.map((_, idx) => {
                      const isCurrent = idx === currentMansetIndex;
                      return (
                        <button
                          key={`manset-num-${idx}`}
                          onClick={() => setCurrentMansetIndex(idx)}
                          className={`flex-1 min-w-[32px] py-2 rounded text-xs sm:text-sm font-black transition relative ${
                            isCurrent
                              ? "bg-red-600 text-white shadow-lg shadow-red-600/40"
                              : "bg-[#181d28] text-gray-400 hover:text-white hover:bg-gray-800"
                          }`}
                        >
                          {idx + 1}
                          {isCurrent && (
                            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-white"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SAĞ KOLON: DAKİKA DAKİKA SON DAKİKA AKIŞI (4 Kolon) */}
              <div className="lg:col-span-4 bg-[#121622] border border-gray-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[520px] sm:h-[580px]">
                {/* Başlık */}
                <div className="bg-[#181e2b] px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse-fast"></span>
                    <h3 className="font-black text-sm uppercase tracking-wider text-white">
                      DAKİKA DAKİKA SON DAKİKA
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">CANLI AKIŞ</span>
                </div>

                {/* Akış Listesi */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-800/80 custom-scrollbar p-1">
                  {sonDakikaAkisi.map((art, idx) => (
                    <div
                      key={`stream-${art.id}-${idx}`}
                      onClick={() => setReadingArticle(art)}
                      className="p-3 hover:bg-[#1c2230] cursor-pointer transition group"
                    >
                      <div className="flex items-start space-x-3">
                        {/* Saat Rozeti */}
                        <div className="shrink-0 text-center">
                          <span className="inline-block bg-red-950/60 border border-red-800/50 text-red-400 font-mono text-[11px] font-bold px-1.5 py-0.5 rounded">
                            {art.timeAgo}
                          </span>
                        </div>

                        {/* İçerik */}
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

                {/* Alt Bilgi */}
                <div className="bg-[#0b0e14] px-4 py-2 text-[11px] text-gray-400 border-t border-gray-800 flex items-center justify-between">
                  <span>Toplam {articles.length} doğrulanmış telgraf</span>
                  <span className="text-emerald-400 font-mono">● Otomatik Senkron</span>
                </div>
              </div>
            </div>

            {/* 4'LÜ SÜRMANŞET KUŞAĞI (Alt Manşetler) */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b-2 border-red-600 pb-2">
                <Flame className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-black uppercase tracking-wider text-white">
                  ÖNE ÇIKAN FLAŞ GELİŞMELER
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {surmansetler.map((art) => (
                  <div
                    key={`sur-${art.id}`}
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
                        <span className="text-red-500 font-semibold group-hover:underline">Detayı Oku →</span>
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

            {/* DÜNYA & JEOPOLİTİK GÜNDEM BLOKU */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* DÜNYA GÜNDEMİ */}
              <div className="bg-[#121622] border border-gray-800 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b-2 border-blue-600 pb-2">
                  <div className="flex items-center space-x-2">
                    <Globe2 className="w-4 h-4 text-blue-500" />
                    <h3 className="font-black text-sm uppercase text-white tracking-wide">DÜNYA & DİPLOMASİ</h3>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">BÖLGESEL RAPORLAR</span>
                </div>

                <div className="space-y-3">
                  {dunyaHaberleri.map((art) => (
                    <div
                      key={`dunya-${art.id}`}
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

              {/* EKONOMİ & PİYASALAR */}
              <div className="bg-[#121622] border border-gray-800 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <h3 className="font-black text-sm uppercase text-white tracking-wide">EKONOMİ & TİCARET</h3>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">KÜRESEL PİYASALAR</span>
                </div>

                <div className="space-y-3">
                  {ekonomiHaberleri.map((art) => (
                    <div
                      key={`eko-${art.id}`}
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

              {/* SAVUNMA & ÇATIŞMA */}
              <div className="bg-[#121622] border border-gray-800 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b-2 border-red-600 pb-2">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    <h3 className="font-black text-sm uppercase text-white tracking-wide">SAVUNMA & ÇATIŞMA</h3>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">GÜVENLİK HATTI</span>
                </div>

                <div className="space-y-3">
                  {savunmaHaberleri.map((art) => (
                    <div
                      key={`sav-${art.id}`}
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
                Bağımsız Küresel Ajans Dağıtım & Son Dakika Haber Portalı.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <span>Canlı Veri Kaynakları: Reuters, BBC, DW, France 24, Al Jazeera</span>
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
