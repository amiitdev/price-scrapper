import { detectProduct, type ParsedProduct } from "./product-detection";
import { searchStores, type StoreSearchResult } from "./store-search";
import { aggregatePrices, type AggregationResult } from "./price-aggregation";
import { analyzeHistory, type HistoricalInsights } from "./historical-analysis";
import { generateRecommendation, type RecommendationResult } from "./recommendation";
import { getAIProvider } from "../ai/providers";
import { RESPONSE_GENERATOR_SYSTEM_PROMPT } from "../ai/prompts";
import { connectDB } from "../db/mongodb";
import { Product } from "../db/models/Product";
import { PriceHistory } from "../db/models/PriceHistory";
import { SearchHistory } from "../db/models/SearchHistory";
import { Recommendation } from "../db/models/Recommendation";
import { AgentLog } from "../db/models/AgentLog";
import type { StoreName } from "../../../types";

export interface AgentStep {
  agent: string;
  status: "success" | "failure";
  duration: number;
  output?: unknown;
}

export interface OrchestratorResult {
  query: string;
  parsedProduct: ParsedProduct;
  steps: AgentStep[];
  aggregation: AggregationResult | null;
  history: HistoricalInsights | null;
  recommendation: RecommendationResult | null;
  response: string;
  productId: string;
  totalDuration: number;
}

async function logAgentStep(
  agentName: string,
  action: string,
  input: unknown,
  output: unknown,
  duration: number,
  status: "success" | "failure",
  error?: string,
) {
  try {
    await AgentLog.create({
      agentId: `${agentName}_${Date.now()}`,
      agentName,
      action,
      input,
      output,
      duration,
      status,
      error: error ?? null,
      executedAt: new Date(),
    });
  } catch (err) {
    console.error("Failed to log agent step:", err);
  }
}

export async function runShoppingAgent(
  query: string,
  userId?: string,
): Promise<OrchestratorResult> {
  const startTime = Date.now();
  const steps: AgentStep[] = [];
  await connectDB();

  let parsedProduct: ParsedProduct;
  try {
    const stepStart = Date.now();
    parsedProduct = await detectProduct(query);
    steps.push({
      agent: "Product Detection",
      status: "success",
      duration: Date.now() - stepStart,
      output: parsedProduct,
    });
    await logAgentStep("product_detection", "detect_product", { query }, parsedProduct, Date.now() - stepStart, "success");
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    steps.push({ agent: "Product Detection", status: "failure", duration: 0 });
    await logAgentStep("product_detection", "detect_product", { query }, null, 0, "failure", errMsg);
    throw new Error(`Product detection failed: ${errMsg}`);
  }

  const searchQuery = [parsedProduct.brand, parsedProduct.product, parsedProduct.storage]
    .filter(Boolean)
    .join(" ");

  let rawResults: Map<StoreName, import("../scrapers/base-scraper").ScrapedProduct[]>;
  try {
    const stepStart = Date.now();
    const results = await searchStores(searchQuery);
    rawResults = new Map();
    for (const r of results) {
      if (r.products.length > 0) {
        rawResults.set(r.store, r.products);
      }
    }
    steps.push({
      agent: "Store Search",
      status: "success",
      duration: Date.now() - stepStart,
      output: { storesFound: rawResults.size, totalProducts: Array.from(rawResults.values()).flat().length },
    });
    await logAgentStep("store_search", "search_stores", { query: searchQuery }, { storesFound: rawResults.size }, Date.now() - stepStart, "success");
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    steps.push({ agent: "Store Search", status: "failure", duration: 0 });
    await logAgentStep("store_search", "search_stores", { query: searchQuery }, null, 0, "failure", errMsg);
    throw new Error(`Store search failed: ${errMsg}`);
  }

  let aggregation: AggregationResult | null = null;
  try {
    const stepStart = Date.now();
    aggregation = await aggregatePrices(rawResults);
    steps.push({
      agent: "Price Aggregation",
      status: "success",
      duration: Date.now() - stepStart,
      output: { lowestPrice: aggregation.lowestPrice, storeCount: aggregation.storeCount },
    });
    await logAgentStep("price_aggregation", "aggregate_prices", { storeCount: rawResults.size }, aggregation, Date.now() - stepStart, "success");
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    steps.push({ agent: "Price Aggregation", status: "failure", duration: 0 });
    await logAgentStep("price_aggregation", "aggregate_prices", null, null, 0, "failure", errMsg);
  }

  let productId = "";
  let history: HistoricalInsights | null = null;
  if (aggregation && aggregation.normalizedProducts.length > 0) {
    for (const product of aggregation.normalizedProducts) {
      const existing = await Product.findOne({ url: product.url });
      let pid: string;
      if (existing) {
        pid = existing._id.toString();
        await PriceHistory.create({
          productId: existing._id,
          price: product.price,
          currency: "INR",
          store: product.store,
          url: product.url,
          available: product.inStock,
          scrapedAt: new Date(),
        });
        await Product.findByIdAndUpdate(existing._id, {
          currentPrice: product.price,
          lastScrapedAt: new Date(),
        });
      } else {
        const created = await Product.create({
          url: product.url,
          name: product.name,
          currentPrice: product.price,
          currency: "INR",
          store: product.store,
          imageUrl: product.imageUrl,
          isActive: true,
          lastScrapedAt: new Date(),
        });
        pid = created._id.toString();
        await PriceHistory.create({
          productId: created._id,
          price: product.price,
          currency: "INR",
          store: product.store,
          url: product.url,
          available: product.inStock,
          scrapedAt: new Date(),
        });
      }
      product.productId = pid;
      if (product.bestMatch) productId = pid;
    }

    const bestProduct = aggregation.normalizedProducts.find((p) => p.bestMatch) ?? aggregation.normalizedProducts[0];
    try {
      const stepStart = Date.now();
      history = await analyzeHistory(productId, bestProduct.price);
      steps.push({
        agent: "Historical Analysis",
        status: "success",
        duration: Date.now() - stepStart,
        output: { trend: history.trend, lowestPrice: history.lowestPrice },
      });
      await logAgentStep("historical_analysis", "analyze_history", { productId, currentPrice: bestProduct.price }, history, Date.now() - stepStart, "success");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      steps.push({ agent: "Historical Analysis", status: "failure", duration: 0 });
      await logAgentStep("historical_analysis", "analyze_history", null, null, 0, "failure", errMsg);
    }
  }

  let recommendation: RecommendationResult | null = null;
  if (history) {
    try {
      const stepStart = Date.now();
      recommendation = await generateRecommendation(history);
      steps.push({
        agent: "Recommendation",
        status: "success",
        duration: Date.now() - stepStart,
        output: { action: recommendation.action, confidence: recommendation.confidence },
      });
      await logAgentStep("recommendation", "generate_recommendation", history, recommendation, Date.now() - stepStart, "success");

      if (productId) {
        await Recommendation.create({
          productId,
          action: recommendation.action,
          confidence: recommendation.confidence,
          reason: recommendation.reason,
          insights: recommendation.insights,
          bestPrice: recommendation.bestPrice,
          potentialSavings: recommendation.potentialSavings,
          currentPrice: history.currentPrice,
          lowestPrice30d: history.lowestPrice,
          lowestPrice90d: history.lowestPrice,
          generatedAt: new Date(),
        });
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      steps.push({ agent: "Recommendation", status: "failure", duration: 0 });
      await logAgentStep("recommendation", "generate_recommendation", null, null, 0, "failure", errMsg);
    }
  }

  let response = "";
  try {
    const provider = getAIProvider();
    response = await provider.complete(
      [
        { role: "system", content: RESPONSE_GENERATOR_SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            query,
            parsedProduct,
            aggregation,
            history,
            recommendation,
          }),
        },
      ],
      { temperature: 0.3, maxTokens: 1024 },
    );
  } catch {
    response = generateFallbackResponse(query, parsedProduct, aggregation, recommendation);
  }

  await SearchHistory.create({
    userId: userId ?? null,
    query,
    results: aggregation?.normalizedProducts.length ?? 0,
    parsedProduct: {
      brand: parsedProduct.brand,
      product: parsedProduct.product,
      storage: parsedProduct.storage,
      color: parsedProduct.color,
      category: parsedProduct.category,
    },
    stores: Array.from(rawResults.keys()),
    duration: Date.now() - startTime,
  });

  return {
    query,
    parsedProduct,
    steps,
    aggregation,
    history,
    recommendation,
    response,
    productId,
    totalDuration: Date.now() - startTime,
  };
}

function generateFallbackResponse(
  query: string,
  parsed: ParsedProduct,
  aggregation: AggregationResult | null,
  recommendation: RecommendationResult | null,
): string {
  const parts: string[] = [];
  parts.push(`## Results for "${query}"\n`);

  if (aggregation && aggregation.normalizedProducts.length > 0) {
    parts.push(`Found **${aggregation.normalizedProducts.length}** listings across **${aggregation.storeCount}** stores.`);
    parts.push(`Price range: ₹${aggregation.lowestPrice.toLocaleString("en-IN")} – ₹${aggregation.highestPrice.toLocaleString("en-IN")}`);
    parts.push(`Average price: ₹${aggregation.averagePrice.toLocaleString("en-IN")}\n`);

    parts.push("### Best Deals\n");
    for (const p of aggregation.normalizedProducts.slice(0, 3)) {
      const tag = p.bestMatch ? " 🏆 **Best Price**" : "";
      parts.push(`- **${p.name}**${tag}`);
      parts.push(`  ₹${p.price.toLocaleString("en-IN")} at ${p.store}`);
    }
  }

  if (recommendation) {
    parts.push(`\n### Recommendation: ${recommendation.action}`);
    parts.push(`Confidence: ${recommendation.confidence}%`);
    parts.push(recommendation.reason);
  }

  return parts.join("\n");
}
