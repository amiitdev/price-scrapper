type CacheValue = string | number | boolean | object | null;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const memoryStore = new Map<string, CacheEntry<CacheValue>>();

export function getCache<T = CacheValue>(key: string): T | null {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setCache(key: string, value: CacheValue, ttlMs = 60_000): void {
  memoryStore.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function delCache(key: string): void {
  memoryStore.delete(key);
}

export function clearCache(): void {
  memoryStore.clear();
}

export async function getOrSet<T extends CacheValue>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 60_000,
): Promise<T> {
  const cached = getCache<T>(key);
  if (cached !== null) return cached;
  const value = await fetcher();
  setCache(key, value, ttlMs);
  return value;
}
