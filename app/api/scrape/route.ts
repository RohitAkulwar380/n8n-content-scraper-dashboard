import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getMonitoredURLsFromSheet } from "../../../lib/google-sheets";
import { scrapeBatch } from "../../../lib/scraping-utils";

export const revalidate = 0;

export async function POST(req: NextRequest) {
  // Attempt to augment sources from Google Sheet stub
  const sheetUrls = await getMonitoredURLsFromSheet();
  if (Array.isArray(sheetUrls) && sheetUrls.length) {
    const records = sheetUrls.map((u) => ({ url: u, domain: new URL(u).hostname }));
    for (const r of records) {
      await prisma.monitored_sources.upsert({
        where: { url: r.url },
        update: { domain: r.domain, is_active: true },
        create: { url: r.url, domain: r.domain },
      });
    }
  }

  const active = await prisma.monitored_sources.findMany({ where: { is_active: true } });
  const urls = active.map((s) => s.url);
  const scraped = await scrapeBatch(urls);

  // NOTE: Here is where content should be parsed and saved to ai_table_urlinputs.
  // For now, we only touch last_scraped timestamps.
  const now = new Date();
  await prisma.$transaction(
    active.map((s) =>
      prisma.monitored_sources.update({ where: { id: s.id }, data: { last_scraped: now } })
    )
  );

  return NextResponse.json({ count: scraped.length });
}




