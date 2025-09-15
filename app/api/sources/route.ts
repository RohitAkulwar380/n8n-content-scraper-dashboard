import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const revalidate = 0;

export async function GET() {
  const sources = await prisma.monitored_sources.findMany({
    where: { is_active: true },
    orderBy: { domain: "asc" },
  });
  return NextResponse.json(sources);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { url, domain, category } = body || {};
  if (!url || !domain) return NextResponse.json({ error: "url and domain required" }, { status: 400 });
  const created = await prisma.monitored_sources.upsert({
    where: { url },
    update: { domain, category, is_active: true },
    create: { url, domain, category },
  });
  return NextResponse.json(created);
}




