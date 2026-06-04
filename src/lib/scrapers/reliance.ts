import { BaseScraper, type ScrapedProduct, type ScraperOptions } from "./base-scraper";

export class RelianceDigitalScraper extends BaseScraper {
  protected storeName = "reliance_digital";

  constructor() {
    super({
      name: "Reliance Digital",
      baseUrl: "https://www.reliancedigital.in",
      searchUrl: "https://www.reliancedigital.in/products?q={query}&page_no=1&page_size=12&page_type=number",
      delayBetweenRequests: 1000,
      maxRetries: 2,
    });
  }

  async search(options: ScraperOptions): Promise<ScrapedProduct[]> {
    const page = await this.createPageWithRetry();
    try {
      const url = this.generateUrl(options.query);
      await this.navigateWithRetry(page, url);

      await page.waitForSelector(".product-card", { timeout: 5000 }).catch(() => {});

      const products = await page.evaluate((maxResults: number) => {
        const items = document.querySelectorAll(".product-card");
        const results: ScrapedProduct[] = [];

        items.forEach((item) => {
          if (results.length >= maxResults) return;

          const nameEl = item.querySelector(".product-card-title");
          const priceEl = item.querySelector(".price");
          const originalPriceEl = item.querySelector(".mrp-amount");
          const discountEl = item.querySelector(".discount");
          const imageEl = item.querySelector("img.fy__img");
          const linkEl = item.querySelector("a.details-container") || item.querySelector("a.product-card-image");

          const name = nameEl?.textContent?.trim() || "";
          const priceText = priceEl?.textContent?.trim() || "0";
          const originalText = originalPriceEl?.textContent?.trim();
          const discountText = discountEl?.textContent?.trim() || "0";
          const href = linkEl?.getAttribute("href") || "";

          const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;
          const originalPrice = originalText ? parseFloat(originalText.replace(/[^0-9.]/g, "")) : null;
          const discount = parseInt(discountText) || 0;

          results.push({
            name,
            price,
            currency: "INR",
            originalPrice,
            discount,
            rating: 0,
            reviewCount: 0,
            seller: "Reliance Digital",
            deliveryDate: null,
            url: href.startsWith("http") ? href : `https://www.reliancedigital.in${href}`,
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
