"use client";
import { TrendingItem } from "../../../lib/trending-algorithm";
import { ExternalLink } from "lucide-react";

export function TrendingCard({ item, searchQuery = "" }: { item: TrendingItem; searchQuery?: string }) {
  
  // Helper function to get category badge styling
  const getCategoryBadge = (category: string | null) => {
    if (!category) return { text: "General", bg: "bg-gray-200", textColor: "text-gray-800" };
    
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('financial') || categoryLower.includes('finance') || categoryLower.includes('market')) {
      return { text: category, bg: "bg-green-200", textColor: "text-green-800" };
    }
    if (categoryLower.includes('health') || categoryLower.includes('mental') || categoryLower.includes('medical')) {
      return { text: category, bg: "bg-blue-200", textColor: "text-blue-800" };
    }
    if (categoryLower.includes('insurance')) {
      return { text: category, bg: "bg-purple-200", textColor: "text-purple-800" };
    }
    if (categoryLower.includes('tech') || categoryLower.includes('technology') || categoryLower.includes('ai')) {
      return { text: category, bg: "bg-orange-200", textColor: "text-orange-800" };
    }
    if (categoryLower.includes('business') || categoryLower.includes('corporate')) {
      return { text: category, bg: "bg-indigo-200", textColor: "text-indigo-800" };
    }
    if (categoryLower.includes('education') || categoryLower.includes('learning')) {
      return { text: category, bg: "bg-pink-200", textColor: "text-pink-800" };
    }
    if (categoryLower.includes('news') || categoryLower.includes('media')) {
      return { text: category, bg: "bg-red-200", textColor: "text-red-800" };
    }
    // Default fallback
    return { text: category, bg: "bg-gray-200", textColor: "text-gray-800" };
  };

  // Helper function to highlight matching keywords
  const highlightKeyword = (keyword: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) return keyword;
    const searchTerm = searchQuery.trim();
    const regex = new RegExp(`\\b(${searchTerm})\\b`, 'gi');
    return keyword.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };
  return (
    <article className="border-[4px] border-black bg-white shadow-[8px_8px_0_#000] hover:shadow-[12px_12px_0_#000] transition-all overflow-hidden">
      {/* Cover Image */}
      <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {item.coverImage ? (
          <>
            <img 
              src={item.coverImage} 
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Replace with placeholder on error
                const container = e.currentTarget.parentElement;
                if (container) {
                  container.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                      <div class="text-center text-gray-400">
                        <div class="text-4xl mb-2">📰</div>
                        <div class="text-sm font-medium">Image Error</div>
                      </div>
                    </div>
                  `;
                }
              }}
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </>
        ) : (
          /* Placeholder when no image */
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-2">📰</div>
              <div className="text-sm font-medium">No Image</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 grid gap-2">
        <div className="flex items-center gap-2">
          {(() => {
            const badge = getCategoryBadge(item.category);
            return (
              <span className={`border-2 border-black px-2 py-1 font-extrabold ${badge.bg} ${badge.textColor}`}>
                {badge.text}
              </span>
            );
          })()}
        </div>
        <h3 className="text-lg md:text-xl font-extrabold leading-snug">
          {item.url ? (
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-black hover:text-blue-600 hover:underline transition-colors duration-200 flex items-center gap-2 group"
            >
              {item.title}
              <ExternalLink className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
            </a>
          ) : (
            item.title
          )}
        </h3>
        {item.summary && <p className="text-sm md:text-base">{truncate(item.summary, 220)}</p>}
        <div className="flex flex-wrap gap-2 text-xs md:text-sm">
          <Meta label="Domain" value={item.domain} />
          <Meta label="Date" value={item.date} />
        </div>
        {(item.trendingKeywords.length > 0 || item.keywords.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {[...new Set([...item.trendingKeywords, ...item.keywords])].slice(0, 10).map((k, index) => {
              // Check if keyword matches as a complete word
              const isMatch = searchQuery && searchQuery.trim().length >= 2 && 
                new RegExp(`\\b${searchQuery.trim()}\\b`, 'i').test(k);
              return (
                <span 
                  key={`${k}-${index}`} 
                  className={`border-2 border-black px-2 py-1 font-semibold ${
                    isMatch ? 'bg-yellow-200 border-yellow-400' : 'bg-[#FFF8F4]'
                  }`}
                  dangerouslySetInnerHTML={{ __html: highlightKeyword(k) }}
                />
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="border-2 border-black bg-[#F8F4FF] px-2 py-1 font-bold">
      <span className="opacity-70 mr-1">{label}:</span>
      <span>{value ?? "-"}</span>
    </div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 3) + "..." : s;
}





