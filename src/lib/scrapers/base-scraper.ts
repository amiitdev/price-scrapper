import { type Page } from "playwright";
import { createPage, closeBrowser, resetBrowser } from "./browser";
import { randomUserAgent } from "./user-agents";

export interface ScrapedProduct {
  name: string;
  price: number;
  currency: string;
  originalPrice: number | null;
  discount: number;
  rating: number;
  reviewCount: number;
  seller: string;
  deliveryDate: string | null;
  url: string;
  imageUrl: string | null;
  inStock: boolean;
  sku: string | null;
}

export interface ScraperOptions {
  query: string;
  maxResults?: number;
  proxyUrl?: string;
}

export interface ScraperConfig {
  name: string;
  baseUrl: string;
  searchUrl: string;
  delayBetweenRequests: number;
  maxRetries: number;
}

export abstract class BaseScraper {
  protected config: ScraperConfig;
  protected abstract storeName: string;

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  abstract search(options: ScraperOptions): Promise<ScrapedProduct[]>;

  async scrape(options: ScraperOptions): Promise<ScrapedProduct[]> {
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const results = await this.search(options);
        if (results.length > 0) return results;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(
          `[${this.storeName}] Attempt ${attempt}/${this.config.maxRetries} failed:`,
          lastError.message,
        );
        await resetBrowser();
        if (attempt < this.config.maxRetries) {
          await this.delay(this.config.delayBetweenRequests * attempt);
        }
      }
    }
    console.error(`[${this.storeName}] All retries exhausted for query: "${options.query}"`);
    return [];
  }

  protected async createPageWithRetry(): Promise<Page> {
    const page = await createPage();
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-IN,en;q=0.9,hi;q=0.8",
    });
    return page;
  }

  protected async navigateWithRetry(page: Page, url: string): Promise<void> {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    }).catch(() => {});
    await this.randomDelay(500, 1000);
  }

  protected async randomDelay(min = 500, max = 1500): Promise<void> {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise((r) => setTimeout(r, ms));
  }

  protected async delay(ms: number): Promise<void> {
    await new Promise((r) => setTimeout(r, ms));
  }

  protected extractPrice(text: string): number {
    const cleaned = text.replace(/[^0-9.]/g, "");
    return parseFloat(cleaned) || 0;
  }

  protected generateUrl(query: string): string {
    return this.config.searchUrl.replace("{query}", encodeURIComponent(query));
  }

  async cleanup(): Promise<void> {
    await closeBrowser();
  }
}
