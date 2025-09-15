import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { buildCacheKey, getCachedJson, setCachedJson } from "../../../lib/redis";

export const revalidate = 0;

export async function GET() {
  const cacheKey = buildCacheKey(["stats", "categories", "v1"]);
  const cached = await getCachedJson<Record<string, number>>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const rows = await prisma.ai_table_urlinputs.groupBy({
    by: ["Category"],
    _count: { _all: true },
  });

  const stats: Record<string, number> = {};
  for (const row of rows) {
    const key = row.Category ?? "Unknown";
    stats[key] = row._count._all;
  }

  await setCachedJson(cacheKey, stats, 300);
  return NextResponse.json(stats);
}



