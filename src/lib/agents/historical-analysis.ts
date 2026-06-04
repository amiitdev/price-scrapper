import { getAIProvider } from "../ai/providers";
import { HISTORICAL_ANALYSIS_SYSTEM_PROMPT } from "../ai/prompts";
import { connectDB } from "../db/mongodb";
import { PriceHistory } from "../db/models/PriceHistory";
import type { Types } from "mongoose";

export interface HistoricalInsights {
  currentPrice: number;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  volatility: number;
  trend: "up" | "down" | "stable";
  sevenDayChange: number;
  thirtyDayChange: number;
  ninetyDayChange: number;
  priceTargets: Array<{ price: number; probability: number; timeframe: string }>;
  seasonalPatterns: string[];
  summary: string;
}

export async function analyzeHistory(
  productId: string | Types.ObjectId,
  currentPrice: number,
): Promise<HistoricalInsights> {
  await connectDB();

  const now = new Date();
  const ranges = {
    sevenDays: new Date(now.getTime() - 7 * 86400000),
    thirtyDays: new Date(now.getTime() - 30 * 86400000),
    ninetyDays: new Date(now.getTime() - 90 * 86400000),
  };

  const [sevenDayData, thirtyDayData, ninetyDayData] = await Promise.all([
    PriceHistory.find({ productId, scrapedAt: { $gte: ranges.sevenDays } })
      .sort({ scrapedAt: -1 }).lean(),
    PriceHistory.find({ productId, scrapedAt: { $gte: ranges.thirtyDays } })
      .sort({ scrapedAt: -1 }).lean(),
    PriceHistory.find({ productId, scrapedAt: { $gte: ranges.ninetyDays } })
      .sort({ scrapedAt: -1 }).lean(),
  ]);

  const calcStats = (data: typeof sevenDayData) => {
    if (data.length === 0) return { low: currentPrice, high: currentPrice, avg: currentPrice };
    const prices = data.map((d) => d.price);
    return {
      low: Math.min(...prices),
      high: Math.max(...prices),
      avg: prices.reduce((s, p) => s + p, 0) / prices.length,
    };
  };

  const stats7 = calcStats(sevenDayData);
  const stats30 = calcStats(thirtyDayData);
  const stats90 = calcStats(ninetyDayData);

  const sevenDayChange = sevenDayData.length >= 2
    ? ((sevenDayData[0].price - sevenDayData[sevenDayData.length - 1].price) / sevenDayData[sevenDayData.length - 1].price) * 100
    : 0;
  const thirtyDayChange = thirtyDayData.length >= 2
    ? ((thirtyDayData[0].price - thirtyDayData[thirtyDayData.length - 1].price) / thirtyDayData[thirtyDayData.length - 1].price) * 100
    : 0;
  const ninetyDayChange = ninetyDayData.length >= 2
    ? ((ninetyDayData[0].price - ninetyDayData[ninetyDayData.length - 1].price) / ninetyDayData[ninetyDayData.length - 1].price) * 100
    : 0;

  const allPrices = [...sevenDayData, ...thirtyDayData, ...ninetyDayData].map((d) => d.price);
  const mean = allPrices.reduce((s, p) => s + p, 0) / Math.max(allPrices.length, 1);
  const variance = allPrices.reduce((s, p) => s + (p - mean) ** 2, 0) / Math.max(allPrices.length, 1);
  const volatility = Math.sqrt(variance);

  const trend: "up" | "down" | "stable" =
    thirtyDayChange > 2 ? "up" : thirtyDayChange < -2 ? "down" : "stable";

  let summary = "";
  try {
    const provider = getAIProvider();
    const aiResult = await provider.completeJSON<{ summary: string }>(
      [
        { role: "system", content: HISTORICAL_ANALYSIS_SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            currentPrice,
            stats7,
            stats30,
            stats90,
            sevenDayChange,
            thirtyDayChange,
            ninetyDayChange,
            volatility,
            trend,
          }),
        },
      ],
      { temperature: 0.1, maxTokens: 512 },
    );
    summary = aiResult.summary;
  } catch {
    summary = trend === "down"
      ? "Price is trending downward — good time to consider buying."
      : trend === "up"
        ? "Price is rising — buying sooner may be better."
        : "Price has been stable recently.";
  }

  return {
    currentPrice,
    lowestPrice: stats90.low,
    highestPrice: stats90.high,
    averagePrice: stats90.avg,
    volatility,
    trend,
    sevenDayChange,
    thirtyDayChange,
    ninetyDayChange,
    priceTargets: [],
    seasonalPatterns: [],
    summary,
  };
}
