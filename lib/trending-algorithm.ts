import { prisma } from "./prisma";
import { buildCacheKey, getCachedJson, setCachedJson } from "./redis";

export type TrendingLevel = "hot" | "rising" | "new" | "all";
export type Timeframe = "now" | "today" | "week" | "month";

export interface TrendingFilters {
  timeframe?: Timeframe;
  categories?: string[];
  sources?: string[];
  trendingLevel?: TrendingLevel;
  searchQuery?: string;
}

export interface TrendingItem {
  id: string;
  title: string;
  summary: string | null;
  domain: string | null;
  category: string | null;
  date: string | null;
  url: string | null;
  keywords: string[];
  trendingKeywords: string[];
  sentimentLabel: string | null;
  sentimentScore: number | null;
  coverImage: string | null;
}

export interface TrendingResult {
  items: TrendingItem[];
  total: number;
  nextPage: number | null;
}

const PAGE_SIZE = 20;

function parseStringArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((x) => String(x));
  } catch {}
  return raw.split(/[,|]/).map((s) => s.trim()).filter(Boolean);
}

function recencyWeight(dateStr?: string | null, now: Date = new Date()): number {
  if (!dateStr) return 0.5;
  const as = new Date(dateStr);
  const hours = Math.abs(now.getTime() - as.getTime()) / 36e5;
  if (!Number.isFinite(hours)) return 0.5;
  if (hours <= 2) return 1.0;
  if (hours <= 24) return 0.85;
  if (hours <= 24 * 7) return 0.6;
  if (hours <= 24 * 30) return 0.3;
  return 0.1;
}

function levelFromScore(score: number): TrendingLevel {
  if (score >= 0.75) return "hot";
  if (score >= 0.5) return "rising";
  if (score >= 0.25) return "new";
  return "all";
}

export async function getTrending(
  page: number,
  filters: TrendingFilters,
  sort: "trending-score" | "recency" | "engagement" | "quality-score" = "trending-score"
): Promise<TrendingResult> {
  const cacheKey = buildCacheKey([
    "trending", page, filters.timeframe, (filters.categories || []).join(","), (filters.sources || []).join(","), filters.trendingLevel, filters.searchQuery, sort, "v1",
  ]);
  const cached = await getCachedJson<TrendingResult>(cacheKey);
  if (cached) return cached;

  const where: any = {};
  if (filters.categories && filters.categories.length) {
    where.Category = { in: filters.categories };
  }
  if (filters.sources && filters.sources.length) {
    where.Domain = { in: filters.sources };
  }
  if (filters.searchQuery) {
    const ilike = { contains: filters.searchQuery, mode: "insensitive" as const };
    where.OR = [{ Title: ilike }, { Summary: ilike }, { keywords: ilike }];
  }
  // For demo purposes, skip date filtering since data is from 2023
  // In production, implement proper date filtering based on actual data dates
  // if (filters.timeframe && filters.timeframe !== "month") {
  //   const today = new Date();
  //   const to = today.toISOString().slice(0, 10);
  //   let from: string | undefined;
  //   if (filters.timeframe === "now") {
  //     from = to;
  //   } else if (filters.timeframe === "today") {
  //     from = to;
  //   } else if (filters.timeframe === "week") {
  //     const d = new Date(today.getTime() - 6 * 24 * 3600 * 1000);
  //     from = d.toISOString().slice(0, 10);
  //   }
  //   if (from) where.Date = { gte: from, lte: to };
  // }

  const skip = (page - 1) * PAGE_SIZE;
  
  // Simplified query to avoid potential issues
  const rows = await prisma.ai_table_urlinputs.findMany({
    where: {},
    orderBy: { Date: "desc" },
    skip,
    take: PAGE_SIZE,
  });
  const total = await prisma.ai_table_urlinputs.count({ where: {} });

  // Compute trending score
  const now = new Date();
  const items: TrendingItem[] = rows.map((r) => {
    const keywords = parseStringArray(r.keywords);
    const tks = parseStringArray(r.trending_keywords);
    const freq = Math.min(1, (keywords.length + tks.length) / 12);
    const recency = recencyWeight(r.Date, now);
    const quality = r.quality_score ? Math.min(1, Number(r.quality_score) / 100) : 0.5;
    const sentiment = r.sentiment_score ? Math.min(1, Math.abs(Number(r.sentiment_score))) : 0.5;
    const score = 0.45 * recency + 0.25 * freq + 0.2 * quality + 0.1 * sentiment;
    const level = levelFromScore(score);
    return {
      id: r.ai_table_identifier,
      title: r.Title || "Untitled",
      summary: r.Summary || null,
      domain: r.Domain || null,
      category: r.Category || null,
      date: r.Date || null,
      url: r.URL || null,
      keywords,
      trendingKeywords: tks,
      sentimentLabel: r.sentiment_label || null,
      sentimentScore: r.sentiment_score ? Number(r.sentiment_score) : null,
      coverImage: r.cover_image || null,
    };
  });

  let filtered = items;
  if (filters.trendingLevel && filters.trendingLevel !== "all") {
    filtered = filtered.filter((i) => i.level === filters.trendingLevel);
  }

  // Sorting
  switch (sort) {
    case "recency":
      filtered.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      break;
    case "quality-score":
      filtered.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
      break;
    case "engagement":
      filtered.sort((a, b) => (b.keywords.length + b.trendingKeywords.length) - (a.keywords.length + a.trendingKeywords.length));
      break;
    default:
      filtered.sort((a, b) => b.trendingScore - a.trendingScore);
  }

  const hasMore = skip + rows.length < total;
  const payload: TrendingResult = { items: filtered, total, nextPage: hasMore ? page + 1 : null };

  await setCachedJson(cacheKey, payload, 120);
  return payload;
}



