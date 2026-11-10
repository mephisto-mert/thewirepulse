import { fetchLiveWireNews, WireArticle } from "./feeds";

interface CacheState {
  data: WireArticle[];
  cachedAt: number;
  isFetching: boolean;
}

const CACHE_TTL_MS = 60 * 1000;       // Fresh for 60 seconds
const STALE_TTL_MS = 5 * 60 * 1000;  // Serve stale up to 5 minutes

let cache: CacheState = {
  data: [],
  cachedAt: 0,
  isFetching: false,
};

export async function getCachedWireNews(): Promise<{ articles: WireArticle[]; fromCache: boolean }> {
  const now = Date.now();
  const age = now - cache.cachedAt;

  // 1. Fresh cache hit (< 60s) -> Return immediately (< 5ms)
  if (cache.data.length > 0 && age < CACHE_TTL_MS) {
    return { articles: cache.data, fromCache: true };
  }

  // 2. Stale cache hit (60s - 300s) -> Return stale immediately, trigger background refresh
  if (cache.data.length > 0 && age < STALE_TTL_MS) {
    if (!cache.isFetching) {
      cache.isFetching = true;
      fetchLiveWireNews()
        .then((fresh) => {
          if (fresh.length > 0) {
            cache.data = fresh;
            cache.cachedAt = Date.now();
          }
        })
        .catch((err) => console.error("[Cache SWR Error]", err))
        .finally(() => {
          cache.isFetching = false;
        });
    }
    return { articles: cache.data, fromCache: true };
  }

  // 3. Cold cache / expired -> Fetch synchronously
  try {
    const fresh = await fetchLiveWireNews();
    if (fresh.length > 0) {
      cache.data = fresh;
      cache.cachedAt = Date.now();
    }
    return { articles: cache.data, fromCache: false };
  } catch (error) {
    if (cache.data.length > 0) {
      return { articles: cache.data, fromCache: true };
    }
    throw error;
  }
}
