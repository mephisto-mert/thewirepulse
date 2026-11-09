import Parser from "rss-parser";

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
}

const parser = new Parser({
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
  { name: "REUTERS WIRE", url: "https://feeds.bbci.co.uk/news/world/rss.xml", defaultSource: "BBC / REUTERS" },
  { name: "FRANCE 24", url: "https://www.france24.com/en/rss", defaultSource: "FRANCE 24 / AFP" },
  { name: "DEUTSCHE WELLE", url: "https://rss.dw.com/rdf/rss-en-all", defaultSource: "DEUTSCHE WELLE" },
  { name: "AL JAZEERA", url: "https://www.aljazeera.com/xml/rss/all.xml", defaultSource: "AL JAZEERA" }
];

function classifyCategory(title: string, summary: string): WireArticle["category"] {
  const text = `${title} ${summary}`.toLowerCase();
  if (/(war|strike|missile|drone|military|defense|army|soldier|airbase|israel|gaza|iran|ukraine|russia|syria|pentagon|weapons)/i.test(text)) {
    return "WAR & DEFENSE";
  }
  if (/(ai|tech|nvidia|apple|google|openai|chip|microprocessor|semiconductor|cyber|robot|software|quantum)/i.test(text)) {
    return "AI & TECH";
  }
  if (/(market|stocks|inflation|economy|dollar|oil|nasdaq|bank|federal reserve|trade|tariff|bitcoin|crypto|gold|shares)/i.test(text)) {
    return "MARKETS";
  }
  if (/(election|parliament|congress|senate|president|minister|trump|biden|putin|macron|scholz|pm|vote|policy|bill|impeachment)/i.test(text)) {
    return "POLITICS";
  }
  return "WORLD AFFAIRS";
}

function calculateTimeAgo(dateString?: string): string {
  if (!dateString) return "Just now";
  const now = new Date();
  const past = new Date(dateString);
  const diffMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function extractImage(item: any): string {
  if (item.mediaContent && Array.isArray(item.mediaContent) && item.mediaContent.length > 0) {
    const valid = item.mediaContent.find((m: any) => m?.$?.url && !m.$.url.includes("placeholder"));
    if (valid?.$?.url) return valid.$.url;
  }
  if (item.enclosure?.url && (item.enclosure.url.endsWith(".jpg") || item.enclosure.url.endsWith(".png") || item.enclosure.url.includes("image"))) {
    return item.enclosure.url;
  }
  if (item.mediaThumbnail?.$?.url) {
    return item.mediaThumbnail.$.url;
  }
  // Try finding <img src="..."> in description
  const content = item.contentEncoded || item.content || item.summary || "";
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match && match[1]) {
    return match[1];
  }
  return "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80"; // Fallback editorial wire image
}

export async function fetchLiveWireNews(): Promise<WireArticle[]> {
  const allArticles: WireArticle[] = [];
  const seenTitles = new Set<string>();

  await Promise.allSettled(
    WIRE_FEEDS.map(async (feed) => {
      try {
        const res = await parser.parseURL(feed.url);
        for (const item of (res.items || []).slice(0, 10)) {
          const title = (item.title || "").replace(/ - BBC News/g, "").replace(/ - DW - .*/g, "").trim();
          if (!title || seenTitles.has(title.toLowerCase())) continue;
          seenTitles.add(title.toLowerCase());

          const summary = (item.contentSnippet || item.summary || "").replace(/<[^>]*>?/gm, "").trim();
          const category = classifyCategory(title, summary);
          const timeAgo = calculateTimeAgo(item.pubDate || item.isoDate);
          const imageUrl = extractImage(item);

          allArticles.push({
            id: Buffer.from(title).toString("base64").substring(0, 16),
            title,
            summary: summary.slice(0, 220) + (summary.length > 220 ? "..." : ""),
            source: feed.defaultSource,
            url: item.link || "#",
            category,
            publishedAt: item.pubDate || new Date().toISOString(),
            timeAgo,
            imageUrl
          });
        }
      } catch (err) {
        console.error(`Feed fetch error for ${feed.name}:`, err);
      }
    })
  );

  // Sort descending by pubDate
  allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return allArticles;
}
