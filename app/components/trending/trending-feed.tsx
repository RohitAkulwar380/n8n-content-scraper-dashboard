"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TrendingCard } from "./trending-card";

type Sort = "recency" | "engagement";

interface TrendingFeedProps {
  selectedCategory?: string | null;
}

export function TrendingFeed({ selectedCategory }: TrendingFeedProps) {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState<number | null>(1);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [timeframe, setTimeframe] = useState<string>("today");
  const [sort, setSort] = useState<Sort>("recency");

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    if (q) p.set("q", q);
    if (timeframe) p.set("timeframe", timeframe);
    if (sort) p.set("sort", sort);
    if (selectedCategory) p.set("category", selectedCategory);
    return p.toString();
  }, [page, q, timeframe, sort, selectedCategory]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/trending?${query}`);
      if (!r.ok) {
        throw new Error(`HTTP ${r.status}: ${r.statusText}`);
      }
      const data = await r.json();
      setItems((prev) => (page === 1 ? data.items : [...prev, ...data.items]));
      setNextPage(data.nextPage);
    } catch (error) {
      console.error('Failed to load trending data:', error);
      setItems([]);
      setNextPage(null);
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => { setPage(1); }, [q, timeframe, sort, selectedCategory]);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="grid gap-4 md:gap-6">
      <div className="border-[4px] border-black bg-[#FFF8F4] p-4 shadow-[8px_8px_0_#000] grid gap-3">
        <div className="grid md:grid-cols-3 gap-3">
          <input className="border-2 border-black px-3 py-2 font-bold bg-white" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="border-2 border-black px-3 py-2 font-bold bg-white" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
            <option value="now">Now</option>
            <option value="today">Today</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
          <select className="border-2 border-black px-3 py-2 font-bold bg-white" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="recency">Recency</option>
            <option value="engagement">Engagement</option>
          </select>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {items.map((it) => (
          <TrendingCard key={it.id} item={it} searchQuery={q} />
        ))}
      </section>

      {loading && (
        <div className="text-center font-bold border-2 border-black bg-yellow-200 px-3 py-2 w-fit mx-auto">Loading...</div>
      )}

      <InfiniteScroll hasMore={Boolean(nextPage)} loading={loading} onMore={() => { if (nextPage && !loading) setPage(nextPage); }} />
    </div>
  );
}

function InfiniteScroll({ hasMore, loading, onMore }: { hasMore: boolean; loading: boolean; onMore: () => void }) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref || !hasMore || loading) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) onMore();
    });
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, hasMore, loading, onMore]);
  return <div ref={setRef} className="h-10" />;
}



