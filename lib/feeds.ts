import Parser from "rss-parser";
import crypto from "crypto";

export interface WireArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  category: "WAR & DEFENSE" | "AI & TECH" | "WORLD AFFAIRS" | "MARKETS" | "POLITICS";
  publishedAt: string;
  timeAgo: string;
  imageUrl: string;
  desk: string;
  readTime: string;
  isEditorsPick?: boolean;
}

const parser = new Parser({
  timeout: 7000,
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail"],
      ["enclosure", "enclosure"],
      ["content:encoded", "contentEncoded"]
    ]
  }
});

export const WIRE_FEEDS = [
  { name: "REUTERS WIRE", url: "https://feeds.bbci.co.uk/news/world/rss.xml", defaultSource: "BBC / Reuters", desk: "London Wire Desk" },
  { name: "FRANCE 24", url: "https://www.france24.com/en/rss", defaultSource: "France 24 / AFP", desk: "Paris Bureau" },
  { name: "DEUTSCHE WELLE", url: "https://rss.dw.com/rdf/rss-en-all", defaultSource: "Deutsche Welle", desk: "European Affairs Desk" },
  { name: "AL JAZEERA", url: "https://www.aljazeera.com/xml/rss/all.xml", defaultSource: "Al Jazeera Wire", desk: "Middle East Bureau" }
];

const ALLOWED_FEED_HOSTS = new Set([
  "feeds.bbci.co.uk",
  "www.france24.com",
  "rss.dw.com",
  "www.aljazeera.com"
]);

export function sanitizeSafeUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== "string") return "#";
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    // Malformed URL
  }
  return "#";
}

export function sanitizePlainText(rawText: string, maxLength = 300): string {
  if (!rawText) return "";
  return rawText
    .slice(0, maxLength * 3)
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

// Rich, diverse high-res editorial photography matching topics
const CURATED_TOPICAL_IMAGES: Record<string, string[]> = {
  "WAR & DEFENSE": [
    "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=85"
  ],
  "AI & TECH": [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=85"
  ],
  "MARKETS": [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=85"
  ],
  "POLITICS": [
    "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=85"
  ],
  "WORLD AFFAIRS": [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=1200&q=85"
  ]
};

function classifyCategory(title: string, summary: string): WireArticle["category"] {
  const text = `${title} ${summary}`.slice(0, 500).toLowerCase();
  if (/(war|strike|missile|drone|military|defense|army|soldier|airbase|israel|gaza|iran|ukraine|russia|syria|pentagon|weapons|lebanon)/i.test(text)) {
    return "WAR & DEFENSE";
  }
  if (/(ai|tech|nvidia|apple|google|openai|chip|microprocessor|semiconductor|cyber|robot|software|quantum|cloud|meta)/i.test(text)) {
    return "AI & TECH";
  }
  if (/(market|stocks|inflation|economy|dollar|oil|nasdaq|bank|federal reserve|trade|tariff|bitcoin|crypto|gold|shares|gdp)/i.test(text)) {
    return "MARKETS";
  }
  if (/(election|president|minister|parliament|congress|senate|vote|treaty|diplomat|government|white house|un |united nations)/i.test(text)) {
    return "POLITICS";
  }
  return "WORLD AFFAIRS";
}

function calculateTimeAgo(dateString?: string): string {
  if (!dateString) return "Recent";
  const past = new Date(dateString);
  if (isNaN(past.getTime())) return "Recent";
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function extractImage(item: any, category: string, index: number): string {
  if (item.mediaContent && Array.isArray(item.mediaContent) && item.mediaContent.length > 0) {
    const valid = item.mediaContent.find((m: any) => m?.$?.url && !m.$.url.includes("placeholder") && !m.$.url.includes("avatar"));
    if (valid?.$?.url) return sanitizeSafeUrl(valid.$.url);
  }
  if (item.enclosure?.url && (item.enclosure.url.endsWith(".jpg") || item.enclosure.url.endsWith(".png") || item.enclosure.url.includes("image"))) {
    return sanitizeSafeUrl(item.enclosure.url);
  }
  if (item.mediaThumbnail?.$?.url) {
    return sanitizeSafeUrl(item.mediaThumbnail.$.url);
  }
  const content = (item.contentEncoded || item.content || item.summary || "").slice(0, 2048);
  const match = content.match(/<img[^>]+src=["'](https?:\/\/[^"'\s]+)["']/i);
  if (match && match[1] && !match[1].includes("blank") && !match[1].includes("spacer")) {
    return sanitizeSafeUrl(match[1]);
  }
  
  // Pick contextual topic photo from high-res curated list
  const categoryImages = CURATED_TOPICAL_IMAGES[category] || CURATED_TOPICAL_IMAGES["WORLD AFFAIRS"];
  return categoryImages[index % categoryImages.length];
}

export async function fetchLiveWireNews(): Promise<WireArticle[]> {
  const allArticles: WireArticle[] = [];
  const seenTitles = new Set<string>();

  await Promise.allSettled(
    WIRE_FEEDS.map(async (feed, feedIdx) => {
      try {
        const feedUrl = new URL(feed.url);
        if (!ALLOWED_FEED_HOSTS.has(feedUrl.hostname) || feedUrl.protocol !== "https:") {
          throw new Error(`Feed URL host ${feedUrl.hostname} is not allowed`);
        }
        const res = await parser.parseURL(feed.url);
        for (let i = 0; i < (res.items || []).slice(0, 10).length; i++) {
          const item = res.items[i];
          const rawTitle = sanitizePlainText(
            (item.title || "").replace(/ - BBC News/g, "").replace(/ - DW - .*/g, ""),
            180
          );
          if (!rawTitle || seenTitles.has(rawTitle.toLowerCase())) continue;
          seenTitles.add(rawTitle.toLowerCase());

          const summary = sanitizePlainText(item.contentSnippet || item.summary || "", 260);
          const category = classifyCategory(rawTitle, summary);
          const timeAgo = calculateTimeAgo(item.pubDate || item.isoDate);
          const imageUrl = extractImage(item, category, i + feedIdx * 3);
          const wordCount = (rawTitle + " " + summary).slice(0, 400).split(/\s+/).length;
          const readMins = Math.max(1, Math.round(wordCount / 65));

          const safeUrl = sanitizeSafeUrl(item.link);
          const id = crypto.createHash("sha256").update(rawTitle).digest("hex").slice(0, 16);

          allArticles.push({
            id,
            title: rawTitle,
            summary: summary.slice(0, 240) + (summary.length > 240 ? "..." : ""),
            source: feed.defaultSource,
            url: safeUrl,
            category,
            publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
            timeAgo,
            imageUrl,
            desk: feed.desk,
            readTime: `${readMins} min read`,
            isEditorsPick: i === 0
          });
        }
      } catch (err) {
        console.error(`Error loading wire feed [${feed.name}]:`, err);
      }
    })
  );

  // Sort by freshness
  allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return allArticles;
}
