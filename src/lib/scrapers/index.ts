import { AmazonScraper } from "./amazon";
import { FlipkartScraper } from "./flipkart";
import { RelianceDigitalScraper } from "./reliance";
import type { ScrapedProduct, ScraperOptions } from "./base-scraper";
import type { StoreName } from "../../../types";

const scraperMap: Record<StoreName, { new(): { scrape(options: ScraperOptions): Promise<ScrapedProduct[]>; cleanup(): Promise<void> } }> = {
  amazon: AmazonScraper as any,
  flipkart: FlipkartScraper as any,
  reliance_digital: RelianceDigitalScraper as any,
};

export const SUPPORTED_STORES: StoreName[] = [
  "amazon",
  "flipkart",
  "reliance_digital",
];

export async function searchStore(
  store: StoreName,
  options: ScraperOptions,
): Promise<ScrapedProduct[]> {
  const ScraperClass = scraperMap[store];
  if (!ScraperClass) {
    throw new Error(`Unsupported store: ${store}`);
  }
  const scraper = new ScraperClass();
  try {
    return await scraper.scrape(options);
  } finally {
  }
}

export async function searchAllStores(
  options: ScraperOptions,
  stores?: StoreName[],
): Promise<Map<StoreName, ScrapedProduct[]>> {
  const targets = stores ?? SUPPORTED_STORES;
  const results = new Map<StoreName, ScrapedProduct[]>();

  const promises = targets.map(async (store) => {
    try {
      const products = await searchStore(store, options);
      results.set(store, products);
    } catch (error) {
      console.error(`[${store}] Search failed:`, error);
      results.set(store, []);
    }
  });

  await Promise.allSettled(promises);
  return results;
}
