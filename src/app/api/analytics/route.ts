import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { Analytics } from "@/lib/db/models/Analytics";
import { Product } from "@/lib/db/models/Product";
import { PriceHistory } from "@/lib/db/models/PriceHistory";
import { SearchHistory } from "@/lib/db/models/SearchHistory";
import { Alert } from "@/lib/db/models/Alert";
import { apiSuccess, apiError } from "@/lib/api/response";
import { analyticsQuerySchema } from "@/lib/validation/schemas";

const PERIOD_MAP: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "180d": 180,
  "365d": 365,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "30d";
  const store = searchParams.get("store") ?? undefined;
  const category = searchParams.get("category") ?? undefined;

  const parsed = analyticsQuerySchema.safeParse({ period, store, category });
  if (!parsed.success) {
    return apiError("Invalid parameters", 400, parsed.error.flatten());
  }

  await connectDB();

  const days = PERIOD_MAP[parsed.data.period] ?? 30;
  const since = new Date(Date.now() - days * 86400000);

  try {
    const [totalProducts, totalSearches, activeAlerts, recentHistory] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      SearchHistory.countDocuments({ createdAt: { $gte: since } }),
      Alert.countDocuments({ isActive: true }),
      PriceHistory.aggregate([
        { $match: { scrapedAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$scrapedAt" } },
            averagePrice: { $avg: "$price" },
            productCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const cached = await Analytics.findOne({
      type: parsed.data.period.includes("d") ? "daily" : "monthly",
      period: parsed.data.period,
    }).lean();

    return apiSuccess({
      totalProducts,
      totalSearches,
      activeAlerts,
      priceTrend: recentHistory,
      cached,
      period: parsed.data.period,
    });
  } catch (error) {
    return apiError("Failed to fetch analytics", 500);
  }
}
