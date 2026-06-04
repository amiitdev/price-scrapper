import { BaseScraper, type ScrapedProduct, type ScraperOptions } from "./base-scraper";

export class FlipkartScraper extends BaseScraper {
  protected storeName = "flipkart";

  constructor() {
    super({
      name: "Flipkart",
      baseUrl: "https://www.flipkart.com",
      searchUrl: "https://www.flipkart.com/search?q={query}",
      delayBetweenRequests: 1000,
      maxRetries: 2,
    });
  }

  async search(options: ScraperOptions): Promise<ScrapedProduct[]> {
    const page = await this.createPageWithRetry();
    try {
      const url = this.generateUrl(options.query);
      await this.navigateWithRetry(page, url);

      await page.waitForSelector("[data-id]", { timeout: 5000 }).catch(() => {});

      const products = await page.evaluate((maxResults: number) => {
        const items = document.querySelectorAll("[data-id]");
        const results: ScrapedProduct[] = [];

        items.forEach((item) => {
          if (results.length >= maxResults) return;

          const nameEl = item.querySelector(".RG5Slk");
          const priceEl = item.querySelector(".hZ3P6w");
          const ratingEl = item.querySelector(".MKiFS6");
          const imageEl = item.querySelector(".UCc1lI");
          const linkEl = item.querySelector("a.k7wcnx") || item.querySelector("a[href*='/p/']");
          const sellerEl = item.querySelector(".CMXw7N");

          const name = nameEl?.textContent?.trim() || "";
          const priceText = priceEl?.textContent?.trim() || "0";
          const ratingText = ratingEl?.textContent?.trim() || "0";
          const href = linkEl?.getAttribute("href") || "";

          const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;
          const rating = parseFloat(ratingText) || 0;

          results.push({
            name,
            price,
            currency: "INR",
            originalPrice: null,
            discount: 0,
            rating,
            reviewCount: 0,
            seller: "Flipkart",
            deliveryDate: null,
            url: href.startsWith("http") ? href : `https://www.flipkart.com${href}`,
            imageUrl: imageEl?.getAttribute("src") || null,
            inStock: true,
            sku: null,
          });
        });
        return results;
      }, options.maxResults || 10);

      return products;
    } finally {
      await page.close();
    }
  }
}
