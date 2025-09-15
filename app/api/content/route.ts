import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { buildCacheKey, getCachedJson, setCachedJson } from "../../../lib/redis";

export const revalidate = 0;

const PAGE_SIZE = 20;

type SortOptions =
  | "date-desc" | "date-asc"
  | "quality-desc" | "quality-asc"
  | "sentiment-desc" | "sentiment-asc"
  | "title-asc" | "title-desc";

function parseNumber(value: string | null, fallback: number): number {
  const n = value ? Number(value) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseNumber(searchParams.get("page"), 1);
  const category = searchParams.get("category") || undefined;
  const domain = searchParams.get("domain") || undefined;
  const searchQuery = searchParams.get("q") || undefined;
  const sort = (searchParams.get("sort") as SortOptions | null) || "date-desc";
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  // Build cache key
  const cacheKey = buildCacheKey([
    "content", page, PAGE_SIZE, category, domain, searchQuery, sort, dateFrom, dateTo, "v1",
  ]);
  const cached = await getCachedJson<{ items: unknown[]; nextPage: number | null; total: number }>(cacheKey);
  if (cached) return NextResponse.json(cached);

  // Where clause (fields are strings in schema)
  const where: any = {};
  if (category) where.Category = { equals: category };
  if (domain) where.Domain = { equals: domain };
  if (searchQuery) {
    const ilike = { contains: searchQuery, mode: "insensitive" as const };
    where.OR = [
      { Title: ilike },
      { Summary: ilike },
      { keywords: ilike },
    ];
  }
  if (dateFrom || dateTo) {
    // Dates are strings; filter lexicographically by YYYY-MM-DD
    where.Date = {} as any;
    if (dateFrom) (where.Date as any).gte = dateFrom;
    if (dateTo) (where.Date as any).lte = dateTo;
  }

  // Sorting translation
  const orderBy: any[] = [];
  switch (sort) {
    case "date-asc":
      orderBy.push({ Date: "asc" });
      break;
    case "quality-desc":
      orderBy.push({ quality_score: "desc" });
      break;
    case "quality-asc":
      orderBy.push({ quality_score: "asc" });
      break;
    case "sentiment-desc":
      orderBy.push({ sentiment_score: "desc" });
      break;
    case "sentiment-asc":
      orderBy.push({ sentiment_score: "asc" });
      break;
    case "title-asc":
      orderBy.push({ Title: "asc" });
      break;
    case "title-desc":
      orderBy.push({ Title: "desc" });
      break;
    default:
      orderBy.push({ Date: "desc" });
  }

  const skip = (page - 1) * PAGE_SIZE;

  const [items, total] = await Promise.all([
    prisma.ai_table_urlinputs.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
      select: {
        ai_table_identifier: true,
        Domain: true,
        Category: true,
        Title: true,
        Summary: true,
        URL: true,
        Date: true,
        keywords: true,
        sentiment_label: true,
        sentiment_score: true,
        quality_score: true,
        trending_keywords: true,
      },
    }),
    prisma.ai_table_urlinputs.count({ where }),
  ]);

  const hasMore = skip + items.length < total;
  const payload = {
    items,
    total,
    nextPage: hasMore ? page + 1 : null,
  };

  await setCachedJson(cacheKey, payload, 60);
  return NextResponse.json(payload);
}



