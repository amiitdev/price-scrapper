import type { ScrapedProduct } from "../scrapers/base-scraper";
import type { StoreName } from "../../../types";

export interface NormalizedProduct {
  name: string;
  store: string;
  price: number;
  originalPrice: number | null;
  discount: number;
  rating: number;
  reviewCount: number;
  seller: string;
  url: string;
  imageUrl: string | null;
  inStock: boolean;
  bestMatch: boolean;
  productId?: string;
}

export interface AggregationResult {
  normalizedProducts: NormalizedProduct[];
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  storeCount: number;
}

export async function aggregatePrices(
  rawResults: Map<StoreName, ScrapedProduct[]>,
): Promise<AggregationResult> {
  const flatProducts: NormalizedProduct[] = [];
  for (const [store, products] of rawResults) {
    for (const product of products) {
      flatProducts.push({
        name: product.name,
        store,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        rating: product.rating,
        reviewCount: product.reviewCount,
        seller: product.seller,
        url: product.url,
        imageUrl: product.imageUrl,
        inStock: product.inStock,
        bestMatch: false,
      });
    }
  }

  flatProducts.sort((a, b) => a.price - b.price);
  if (flatProducts.length > 0) {
    flatProducts[0].bestMatch = true;
  }

  const prices = flatProducts.filter((p) => p.price > 0).map((p) => p.price);

  return {
    normalizedProducts: flatProducts,
    lowestPrice: prices.length > 0 ? Math.min(...prices) : 0,
    highestPrice: prices.length > 0 ? Math.max(...prices) : 0,
    averagePrice:
      prices.length > 0
        ? Math.round(prices.reduce((s, p) => s + p, 0) / prices.length)
        : 0,
    storeCount: rawResults.size,
  };
}
