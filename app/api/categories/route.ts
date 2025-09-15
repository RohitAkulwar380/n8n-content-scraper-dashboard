import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { buildCacheKey, getCachedJson, setCachedJson } from "../../../lib/redis";

export const revalidate = 0;

export async function GET() {
  const cacheKey = buildCacheKey(["categories", "v1"]);
  const cached = await getCachedJson<string[]>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const results = await prisma.ai_table_urlinputs.findMany({
    where: { Category: { not: null } },
    select: { Category: true },
    distinct: ["Category"],
    orderBy: { Category: "asc" },
  });
  const categories = results
    .map((r) => r.Category)
    .filter((v): v is string => Boolean(v));

  await setCachedJson(cacheKey, categories, 300);
  return NextResponse.json(categories);
}



