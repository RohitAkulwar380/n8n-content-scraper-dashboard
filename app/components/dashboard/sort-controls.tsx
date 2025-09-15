"use client";
import { useEffect } from "react";

export type SortOption =
  | "date-desc" | "date-asc"
  | "quality-desc" | "quality-asc"
  | "sentiment-desc" | "sentiment-asc"
  | "title-asc" | "title-desc";

export function SortControls({ value, onChange }: { value: SortOption; onChange: (v: SortOption) => void }) {
  useEffect(() => {
    if (!value) onChange("date-desc");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="border-[4px] border-black bg-[#F8F4FF] p-3 shadow-[8px_8px_0_#000]">
      <select
        className="border-2 border-black px-3 py-2 font-bold bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
      >
        <option value="date-desc">Newest</option>
        <option value="date-asc">Oldest</option>
        <option value="quality-desc">Quality ↓</option>
        <option value="quality-asc">Quality ↑</option>
        <option value="sentiment-desc">Sentiment ↓</option>
        <option value="sentiment-asc">Sentiment ↑</option>
        <option value="title-asc">Title A-Z</option>
        <option value="title-desc">Title Z-A</option>
      </select>
    </div>
  );
}



