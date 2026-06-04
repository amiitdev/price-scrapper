"use server";

import { runShoppingAgent } from "@/lib/agents/orchestrator";
import { searchQuerySchema } from "@/lib/validation/schemas";

export async function searchProducts(formData: FormData) {
  const query = formData.get("query") as string;
  const parsed = searchQuerySchema.safeParse({ q: query });
  if (!parsed.success) {
    return { error: "Invalid search query", details: parsed.error.flatten() };
  }

  try {
    const result = await runShoppingAgent(parsed.data.q);
    return { success: true, data: result };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Search failed",
    };
  }
}

export async function getProductHistory(productId: string, days = 30) {
  try {
    const { analyzeHistory } = await import("@/lib/agents/historical-analysis");
    const { connectDB } = await import("@/lib/db/mongodb");
    const { Product } = await import("@/lib/db/models/Product");
    const { PriceHistory } = await import("@/lib/db/models/PriceHistory");

    await connectDB();
    const product = await Product.findById(productId).lean();
    if (!product) return { error: "Product not found" };

    const since = new Date(Date.now() - days * 86400000);
    const history = await PriceHistory.find({
      productId,
      scrapedAt: { $gte: since },
    })
      .sort({ scrapedAt: -1 })
      .lean();

    const insights = await analyzeHistory(productId, product.currentPrice);

    return { success: true, data: { product, history, insights } };
  } catch (error) {
    return { error: "Failed to fetch history" };
  }
}
