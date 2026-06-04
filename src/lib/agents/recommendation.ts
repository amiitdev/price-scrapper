import { getAIProvider } from "../ai/providers";
import { RECOMMENDATION_SYSTEM_PROMPT } from "../ai/prompts";
import type { HistoricalInsights } from "./historical-analysis";

export type RecommendationAction = "BUY_NOW" | "WAIT" | "GOOD_DEAL" | "OVERPRICED";

export interface RecommendationResult {
  action: RecommendationAction;
  confidence: number;
  reason: string;
  insights: string[];
  bestPrice: number | null;
  potentialSavings: number | null;
  expectedDiscountPeriod: string | null;
}

export async function generateRecommendation(
  history: HistoricalInsights,
): Promise<RecommendationResult> {
  const provider = getAIProvider();
  try {
    const result = await provider.completeJSON<RecommendationResult>(
      [
        { role: "system", content: RECOMMENDATION_SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify(history),
        },
      ],
      { temperature: 0.2, maxTokens: 1024 },
    );
    return result;
  } catch {
    const diffFromLow = ((history.currentPrice - history.lowestPrice) / history.lowestPrice) * 100;
    const action: RecommendationAction =
      diffFromLow <= 2 ? "BUY_NOW"
        : history.trend === "down" ? "GOOD_DEAL"
          : diffFromLow > 10 ? "OVERPRICED"
            : "WAIT";

    return {
      action,
      confidence: Math.max(60, Math.min(95, 95 - diffFromLow)),
      reason: `Current price is ${diffFromLow.toFixed(1)}% above the 90-day low of ₹${history.lowestPrice.toLocaleString("en-IN")}.`,
      insights: [
        `90-day low: ₹${history.lowestPrice.toLocaleString("en-IN")}`,
        `90-day high: ₹${history.highestPrice.toLocaleString("en-IN")}`,
        `30-day trend: ${history.thirtyDayChange > 0 ? "up" : "down"} ${Math.abs(history.thirtyDayChange).toFixed(1)}%`,
      ],
      bestPrice: history.lowestPrice,
      potentialSavings: history.currentPrice - history.lowestPrice,
      expectedDiscountPeriod: null,
    };
  }
}
