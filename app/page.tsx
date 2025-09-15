"use client";
import { useState } from "react";
import { TrendingFeed } from "./components/trending/trending-feed";
import { TopBar } from "./components/top-bar";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#F8F4FF] p-4 md:p-6">
      <TopBar 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <TrendingFeed selectedCategory={selectedCategory} />
    </div>
  );
}
