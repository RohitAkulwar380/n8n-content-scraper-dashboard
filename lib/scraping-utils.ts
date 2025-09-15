// Lightweight scraping helpers (server-side only)

export interface ScrapedContent {
  url: string;
  title?: string;
  content?: string;
  publishedAt?: string;
}

export async function scrapeUrl(url: string): Promise<ScrapedContent> {
  // Placeholder: In production, use fetch + cheerio or a headless browser.
  // We just return the URL as-is to keep the interface intact.
  return { url };
}

export async function scrapeBatch(urls: string[]): Promise<ScrapedContent[]> {
  return Promise.all(urls.map((u) => scrapeUrl(u)));
}



