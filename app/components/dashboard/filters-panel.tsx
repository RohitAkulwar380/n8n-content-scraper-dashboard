"use client";
import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";

type Props = {
  onChange: (state: State) => void;
};

export type State = {
  q: string;
  category?: string;
  domain?: string;
  dateFrom?: string;
  dateTo?: string;
};

export function FiltersPanel({ onChange }: Props) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [domain, setDomain] = useState<string | undefined>();
  const [dateFrom, setDateFrom] = useState<string | undefined>();
  const [dateTo, setDateTo] = useState<string | undefined>();
  const [categories, setCategories] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/domains").then((r) => r.json()),
    ]).then(([cats, doms]) => {
      setCategories(cats || []);
      setDomains(doms || []);
    });
  }, []);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => onChange({ q, category, domain, dateFrom, dateTo }), 300);
    return () => clearTimeout(id);
  }, [q, category, domain, dateFrom, dateTo, onChange]);

  return (
    <div className="border-[4px] border-black bg-[#FFF8F4] p-4 shadow-[8px_8px_0_#000] grid gap-3">
      <div className="grid md:grid-cols-5 gap-3">
        <input
          className="border-2 border-black px-3 py-2 font-bold bg-white"
          placeholder="Search..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border-2 border-black px-3 py-2 font-bold bg-white"
          value={category || ""}
          onChange={(e) => setCategory(e.target.value || undefined)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          className="border-2 border-black px-3 py-2 font-bold bg-white"
          value={domain || ""}
          onChange={(e) => setDomain(e.target.value || undefined)}
        >
          <option value="">All Domains</option>
          {domains.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <input
          type="date"
          className="border-2 border-black px-3 py-2 font-bold bg-white"
          value={dateFrom || ""}
          onChange={(e) => setDateFrom(e.target.value || undefined)}
        />
        <input
          type="date"
          className="border-2 border-black px-3 py-2 font-bold bg-white"
          value={dateTo || ""}
          onChange={(e) => setDateTo(e.target.value || undefined)}
        />
      </div>
      <div className="flex gap-3">
        <Button
          className="border-2 border-black bg-yellow-200 hover:bg-yellow-300 shadow-[4px_4px_0_#000] font-extrabold"
          onClick={() => {
            setQ(""); setCategory(undefined); setDomain(undefined); setDateFrom(undefined); setDateTo(undefined);
            onChange({ q: "" });
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}


