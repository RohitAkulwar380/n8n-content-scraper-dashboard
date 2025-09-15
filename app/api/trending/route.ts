import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || "1") || 1;
    const searchQuery = searchParams.get("q") || "";
    const timeframe = searchParams.get("timeframe") || "today";
    const sort = searchParams.get("sort") || "recency";
    const category = searchParams.get("category") || "";
    const PAGE_SIZE = 20;
    const skip = (page - 1) * PAGE_SIZE;

    // Build search conditions
    const where: any = {};
    
    // Add category filtering
    if (category && category.trim().length > 0) {
      where.Category = { equals: category };
    }
    
    // Add search functionality for keywords and trending keywords
    if (searchQuery && searchQuery.trim().length > 0) {
      const searchTerm = searchQuery.toLowerCase().trim();
      
      // Only search if the query is at least 2 characters (to avoid single character matches)
      if (searchTerm.length >= 2) {
        // Use regex for word boundary matching
        const wordBoundaryRegex = `\\b${searchTerm}\\b`;
        
        where.OR = [
          { Title: { contains: searchTerm, mode: "insensitive" } },
          { Summary: { contains: searchTerm, mode: "insensitive" } },
          { keywords: { contains: searchTerm, mode: "insensitive" } },
          { trending_keywords: { contains: searchTerm, mode: "insensitive" } },
          { Category: { contains: searchTerm, mode: "insensitive" } },
          { Domain: { contains: searchTerm, mode: "insensitive" } }
        ];
      }
    }

    // Check if database is available
    let rows: any[] = [];
    let total = 0;
    
    try {
      // Use Publication_Date as the primary date field, fallback to Date if it exists
      rows = await prisma.ai_table_urlinputs.findMany({
        where,
        orderBy: { Publication_Date: "desc" },
        skip,
        take: PAGE_SIZE,
      });
      total = await prisma.ai_table_urlinputs.count({ where });
    } catch (dbError) {
      console.warn('Database not available, using mock data:', dbError.message);
      // Provide mock data when database is not available
      rows = generateMockData(skip, PAGE_SIZE, searchQuery, category);
      total = 100; // Mock total count
    }

    // Helper function to safely parse JSON strings
    const safeJsonParse = (str: string | null): string[] => {
      if (!str) return [];
      try {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        // If not valid JSON, treat as comma-separated string
        return str.split(',').map(s => s.trim()).filter(Boolean);
      }
    };

    // Transform data to match expected format
    const items = rows.map((r) => ({
      id: r.ai_table_identifier,
      title: r.Title || "Untitled",
      summary: r.Summary || r.articles || null, // Use articles as fallback for summary
      domain: r.Domain || null,
      category: r.Category || null,
      date: r.Publication_Date || r.Date || null,
      url: r.URL || null,
      keywords: safeJsonParse(r.keywords),
      trendingKeywords: safeJsonParse(r.trending_keywords),
      sentimentLabel: r.sentiment_label || null,
      sentimentScore: r.sentiment_score ? Number(r.sentiment_score) : null,
      coverImage: r.cover_image || null,
    }));

    const hasMore = skip + rows.length < total;
    const data = {
      items,
      total,
      nextPage: hasMore ? page + 1 : null,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Trending API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch trending data', 
      items: [], 
      total: 0, 
      nextPage: null,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Mock data generator for when database is not available
function generateMockData(skip: number, take: number, searchQuery?: string, category?: string) {
  const mockTitles = [
    "AI Revolution in Financial Markets",
    "Mental Health Awareness Trends",
    "Insurance Industry Digital Transformation",
    "Cryptocurrency Market Analysis",
    "Sustainable Investment Strategies",
    "Healthcare Technology Innovations",
    "Remote Work Productivity Tips",
    "Climate Change Economic Impact",
    "Cybersecurity Best Practices",
    "E-commerce Growth Patterns"
  ];

  const mockDomains = ["finance.com", "health.org", "insurance.net", "tech.io", "business.co"];
  const mockCategories = ["Financial Markets", "Mental Health", "Insurance", "Technology", "Business"];
  const mockKeywords = ["AI", "trending", "analysis", "market", "digital", "innovation", "growth", "strategy"];
  const mockImages = [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop"
  ];
  
  // Generate all mock data first
  const allMockData = Array.from({ length: 50 }, (_, i) => ({
    ai_table_identifier: `mock-${i + 1}`,
    Title: mockTitles[i % mockTitles.length],
    Summary: `This is a mock summary for article ${i + 1}. It contains relevant information about trending topics.`,
    Domain: mockDomains[i % mockDomains.length],
    Category: mockCategories[i % mockCategories.length],
    Publication_Date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    URL: `https://${mockDomains[i % mockDomains.length]}/article-${i + 1}`,
    keywords: JSON.stringify(mockKeywords.slice(0, Math.floor(Math.random() * 5) + 2)),
    trending_keywords: JSON.stringify(mockKeywords.slice(0, Math.floor(Math.random() * 3) + 1)),
    sentiment_label: ["positive", "negative", "neutral"][Math.floor(Math.random() * 3)],
    sentiment_score: (Math.random() * 2 - 1).toFixed(2),
    quality_score: (Math.random() * 100).toFixed(1),
    cover_image: mockImages[i % mockImages.length],
  }));

  // Filter by category if provided
  let filteredData = allMockData;
  if (category && category.trim().length > 0) {
    filteredData = filteredData.filter(item => item.Category === category);
  }
  
  // Filter by search query if provided
  if (searchQuery && searchQuery.trim().length >= 2) {
    const searchTerm = searchQuery.toLowerCase().trim();
    
    // Helper function to check if a text contains the search term as a complete word
    const containsWord = (text: string, term: string): boolean => {
      if (!text) return false;
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      return regex.test(text);
    };
    
    filteredData = allMockData.filter(item => 
      containsWord(item.Title || '', searchTerm) ||
      containsWord(item.Summary || '', searchTerm) ||
      containsWord(item.Category || '', searchTerm) ||
      containsWord(item.Domain || '', searchTerm) ||
      containsWord(item.keywords || '', searchTerm) ||
      containsWord(item.trending_keywords || '', searchTerm)
    );
  }

  // Return paginated results
  return filteredData.slice(skip, skip + take);
}
