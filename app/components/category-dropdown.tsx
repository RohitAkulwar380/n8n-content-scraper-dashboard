"use client";

import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface CategoryDropdownProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export function CategoryDropdown({ selectedCategory, onCategoryChange }: CategoryDropdownProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategorySelect = (category: string | null) => {
    onCategoryChange(category);
  };

  if (loading) {
    return (
      <Button 
        variant="outline" 
        className="border-2 border-black px-4 py-2 font-bold bg-white shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] transition-all"
        disabled
      >
        Loading Categories...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="border-2 border-black px-4 py-2 font-bold bg-white shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] transition-all flex items-center gap-2"
        >
          {selectedCategory || "All Categories"}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 border-2 border-black bg-white shadow-[8px_8px_0_#000]"
        align="start"
      >
        <DropdownMenuItem 
          onClick={() => handleCategorySelect(null)}
          className={`cursor-pointer font-bold px-3 py-2 hover:bg-gray-100 ${
            selectedCategory === null ? 'bg-gray-200' : ''
          }`}
        >
          All Categories
        </DropdownMenuItem>
        {categories.map((category) => (
          <DropdownMenuItem
            key={category}
            onClick={() => handleCategorySelect(category)}
            className={`cursor-pointer font-bold px-3 py-2 hover:bg-gray-100 ${
              selectedCategory === category ? 'bg-gray-200' : ''
            }`}
          >
            {category}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

