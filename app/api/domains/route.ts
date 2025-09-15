import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { buildCacheKey, getCachedJson, setCachedJson } from "../../../lib/redis";

export const revalidate = 0;

export async function GET() {
  const cacheKey = buildCacheKey(["domains", "v1"]);
  const cached = await getCachedJson<string[]>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const results = await prisma.ai_table_urlinputs.findMany({
    where: { Domain: { not: null } },
    select: { Domain: true },
    distinct: ["Domain"],
    orderBy: { Domain: "asc" },
  });
  const domains = results
    .map((r) => r.Domain)
    .filter((v): v is string => Boolean(v));

  await setCachedJson(cacheKey, domains, 300);
  return NextResponse.json(domains);
}



