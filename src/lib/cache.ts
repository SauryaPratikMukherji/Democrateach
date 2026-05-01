// Simple in-memory cache for search results to improve performance and reduce API costs.
// This can be easily replaced with Redis in a production environment.

const searchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export function getCachedSearch(key: string) {
  const cached = searchCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[CACHE] Hit: ${key}`);
    return cached.data;
  }
  return null;
}

export function setCachedSearch(key: string, data: any) {
  console.log(`[CACHE] Set: ${key}`);
  searchCache.set(key, { data, timestamp: Date.now() });
}
