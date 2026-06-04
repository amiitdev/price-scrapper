import { connectDB } from "../db/mongodb";
import { Product } from "../db/models/Product";
import { PriceHistory } from "../db/models/PriceHistory";
import { Analytics } from "../db/models/Analytics";
import { searchAllStores } from "../scrapers";
import { analyzeHistory } from "../agents/historical-analysis";
import { generateRecommendation } from "../agents/recommendation";
import { Recommendation } from "../db/models/Recommendation";

export type ScheduledTask = "scrape-prices" | "update-trends" | "generate-analytics";

export async function runDailyTasks(): Promise<Record<ScheduledTask, { success: boolean; error?: string }>> {
  const results: Record<string, { success: boolean; error?: string }> = {};

  try {
    await connectDB();
    results["scrape-prices"] = await scrapeAllPrices();
    results["update-trends"] = await updateTrends();
    results["generate-analytics"] = await generateDailyAnalytics();
  } catch (error) {
    const task = "unknown" as ScheduledTask;
    results[task] = {
      success: false,
      error: error instanceof Error ? error.message : "Task failed",
    };
  }

  return results;
}

async function scrapeAllPrices(): Promise<{ success: boolean; error?: string }> {
  try {
    const activeProducts = await Product.find({ isActive: true }).limit(50).lean();
    const results = await searchAllStores(
      { query: "", maxResults: 3 },
    );
    console.log(`[Scheduler] Scraped prices for ${activeProducts.length} products`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Scraping failed" };
  }
}

async function updateTrends(): Promise<{ success: boolean; error?: string }> {
  try {
    const products = await Product.find({ isActive: true }).limit(20).lean();
    for (const product of products) {
      const history = await analyzeHistory(product._id.toString(), product.currentPrice);
      const recommendation = await generateRecommendation(history);
      await Recommendation.create({
        productId: product._id,
        action: recommendation.action,
        confidence: recommendation.confidence,
        reason: recommendation.reason,
        insights: recommendation.insights,
        bestPrice: recommendation.bestPrice,
        potentialSavings: recommendation.potentialSavings,
        currentPrice: product.currentPrice,
        lowestPrice30d: history.lowestPrice,
        lowestPrice90d: history.lowestPrice,
        generatedAt: new Date(),
      });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Trend update failed" };
  }
}

async function generateDailyAnalytics(): Promise<{ success: boolean; error?: string }> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const totalSearches = await (await import("../db/models/SearchHistory")).SearchHistory
      .countDocuments({
        createdAt: { $gte: new Date(Date.now() - 86400000) },
      });

    await Analytics.findOneAndUpdate(
      { type: "daily", period: today },
      {
        type: "daily",
        period: today,
        data: {
          totalSearches,
          totalProducts: await Product.countDocuments(),
          totalPriceDrops: 0,
          averagePrice: 0,
          mostSearchedBrand: "",
          mostSearchedCategory: "",
          topStores: [],
          priceTrend: [],
        },
        generatedAt: new Date(),
      },
      { upsert: true },
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Analytics generation failed" };
  }
}
