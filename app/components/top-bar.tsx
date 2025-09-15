"use client";

import { CategoryDropdown } from "./category-dropdown";

interface TopBarProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export function TopBar({ selectedCategory, onCategoryChange }: TopBarProps) {
  return (
    <header className="mb-4 md:mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-extrabold border-[4px] border-black inline-block px-4 py-2 bg-white shadow-[8px_8px_0_#000]">
          AI Trending Topics Dashboard
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="text-sm font-bold text-gray-700">
            Filter by Category:
          </div>
          <CategoryDropdown 
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
          />
        </div>
      </div>
    </header>
  );
}

