"use client";
import { cn } from "../../../lib/utils";

type Item = {
  ai_table_identifier: string;
  Domain: string | null;
  Category: string | null;
  Title: string | null;
  Summary: string | null;
  URL: string | null;
  Date: string | null;
  keywords: string | null;
  sentiment_label: string | null;
  sentiment_score: string | null;
  quality_score: string | null;
  trending_keywords: string | null;
};

export function ContentCard({ item }: { item: Item }) {
  const keywords = parseArray(item.keywords);
  const trending = parseArray(item.trending_keywords);

  const sentimentColor = getSentimentColor(item.sentiment_label);

  return (
    <div
      className={cn(
        "border-[4px] border-black bg-white p-4 md:p-5 shadow-[8px_8px_0_#000] hover:shadow-[12px_12px_0_#000] transition-all",
        "grid gap-3"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <a
          href={normalizeUrl(item.URL)}
          target="_blank"
          rel="noreferrer"
          className="font-extrabold text-lg md:text-xl hover:underline"
        >
          {item.Title || "Untitled"}
        </a>
        <span className={cn("border-2 border-black px-2 py-1 font-bold", sentimentColor)}>
          {item.sentiment_label || "Unknown"}
        </span>
      </div>

      <p className="text-sm md:text-base leading-snug">
        {truncateText(item.Summary || "", 220)}
      </p>
      <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3 text-xs md:text-sm">
        <Meta label="Domain" value={item.Domain} />
        <Meta label="Category" value={item.Category} />
        <Meta label="Date" value={item.Date} />
        <Meta label="Quality" value={item.quality_score} />
        <Meta label="Sentiment Score" value={item.sentiment_score} />
      </div>

      {keywords.length > 0 && (
        <div>
          <h4 className="font-bold mb-2">Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {keywords.map((k) => (
              <span key={k} className="border-2 border-black bg-[#FFF8F4] px-2 py-1 font-semibold">
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      {trending.length > 0 && (
        <div>
          <h4 className="font-bold mb-2">Trending</h4>
          <div className="flex flex-wrap gap-2">
            {trending.map((k) => (
              <span key={k} className="border-2 border-black bg-[#F8F4FF] px-2 py-1 font-semibold">
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="border-2 border-black bg-[#F4FFF8] px-2 py-1 font-bold">
      <span className="opacity-70 mr-1">{label}:</span>
      <span>{value ?? "-"}</span>
    </div>
  );
}

function truncateText(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + "...";
}

function parseArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((x) => String(x));
  } catch {}
  // fallback: comma separated
  return raw.split(/[,|]/).map((s) => s.trim()).filter(Boolean);
}

function getSentimentColor(sent?: string | null) {
  const v = (sent || "").toLowerCase();
  if (v.includes("positive")) return "bg-green-200";
  if (v.includes("negative")) return "bg-red-200";
  if (v.includes("neutral")) return "bg-yellow-200";
  return "bg-gray-200";
}

function normalizeUrl(u: string | null): string | undefined {
  if (!u) return undefined;
  if (u.startsWith("http")) return u;
  return `https://${u}`;
}



