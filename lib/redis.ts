import Redis from "ioredis";

// Singleton Redis client with lazy initialization
let globalRedis: Redis | null = null;

export function getRedisClient(): Redis | null {
  const url = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url) {
    // Allow running without Redis in dev; return null and fallback to DB
    return null;
  }

  if (globalRedis) return globalRedis;

  if (url.startsWith("redis://") || url.startsWith("rediss://")) {
    globalRedis = new Redis(url, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      lazyConnect: true,
    });
  } else if (url && token) {
    // Upstash REST-compatible constructor
    globalRedis = new Redis(url, {
      tls: url.startsWith("https://") ? {} : undefined,
      maxRetriesPerRequest: 2,
      enableReadyCheck: false,
    });
  } else {
    return null;
  }

  return globalRedis;
}

export function buildCacheKey(parts: Array<string | number | boolean | undefined | null>): string {
  return parts
    .map((p) => (p === undefined || p === null ? "~" : String(p)))
    .join(":")
    .toLowerCase();
}

export async function getCachedJson<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;
  const data = await client.get(key);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export async function setCachedJson<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
}



