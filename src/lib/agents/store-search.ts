import { searchAllStores } from "../scrapers";
import type { ScrapedProduct } from "../scrapers/base-scraper";
import type { StoreName } from "../../../types";

export interface StoreSearchResult {
  store: StoreName;
  products: ScrapedProduct[];
  error?: string;
}

export async function searchStores(
  query: string,
  stores?: StoreName[],
  maxPerStore = 5,
): Promise<StoreSearchResult[]> {
  const results = await searchAllStores(
    { query, maxResults: maxPerStore },
    stores,
  );

  const output: StoreSearchResult[] = [];
  for (const [store, products] of results) {
    output.push({ store, products });
  }
  return output;
}
