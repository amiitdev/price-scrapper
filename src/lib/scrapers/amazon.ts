import { BaseScraper, type ScrapedProduct, type ScraperOptions } from "./base-scraper";

export class AmazonScraper extends BaseScraper {
  protected storeName = "amazon";

  constructor() {
    super({
      name: "Amazon India",
      baseUrl: "https://www.amazon.in",
      searchUrl: "https://www.amazon.in/s?k={query}",
      delayBetweenRequests: 1000,
      maxRetries: 2,
    });
  }

  async search(options: ScraperOptions): Promise<ScrapedProduct[]> {
    const page = await this.createPageWithRetry();
    try {
      const url = this.generateUrl(options.query);
      await this.navigateWithRetry(page, url);

      await page.waitForSelector("[data-component-type='s-search-result']", {
        timeout: 5000,
      }).catch(() => {});

      const products = await page.evaluate((maxResults: number) => {
        const items = document.querySelectorAll("[data-component-type='s-search-result']");
        const results: ScrapedProduct[] = [];

        items.forEach((item) => {
          if (results.length >= maxResults) return;

          const nameEl = item.querySelector("h2 a span") || item.querySelector("h2 span");
          const priceEl = item.querySelector(".a-price .a-offscreen") || item.querySelector(".a-price-whole");
          const ratingEl = item.querySelector(".a-star-small .a-icon-alt") || item.querySelector(".a-icon-alt");
          const reviewEl = item.querySelector(".a-size-small .a-size-base") || item.querySelector("a.a-size-small");
          const imageEl = item.querySelector("img.s-image");
          const linkEl = item.querySelector("a[href*='/dp/']") || item.querySelector("a[href*='/product/']") || item.querySelector("a[href*='/gp/']") || item.querySelector("h2 a.a-link-normal") || item.querySelector("a[href*='sspa/click']");
          const sellerEl = item.querySelector(".a-row.a-size-base") || item.querySelector(".a-color-secondary");

          const name = nameEl?.textContent?.trim() || "";
          const priceText = priceEl?.textContent?.trim() || "0";
          const ratingText = ratingEl?.textContent?.trim() || "0";
          const reviewText = reviewEl?.textContent?.trim() || "0";
          const imageUrl = imageEl?.getAttribute("src") || null;
          const url = linkEl?.getAttribute("href") || "";

          const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;
          const rating = parseFloat(ratingText.split(" ")[0]) || 0;
          const reviewCount = parseInt(reviewText.replace(/[^0-9]/g, "")) || 0;

          results.push({
            name,
            price,
            currency: "INR",
            originalPrice: null,
            discount: 0,
            rating,
            reviewCount,
            seller: sellerEl?.textContent?.trim() || "Amazon",
            deliveryDate: null,
            url: url.startsWith("http") ? url : `https://www.amazon.in${url}`,
            imageUrl,
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
