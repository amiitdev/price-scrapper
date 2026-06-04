import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { PriceHistory } from "@/lib/db/models/PriceHistory";
import { analyzeHistory } from "@/lib/agents/historical-analysis";
import { apiSuccess, apiError } from "@/lib/api/response";
import { priceHistoryQuerySchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const days = parseInt(searchParams.get("days") ?? "30");
  const store = searchParams.get("store") ?? undefined;

  const parsed = priceHistoryQuerySchema.safeParse({ productId, days, store });
  if (!parsed.success) {
    return apiError("Invalid parameters", 400, parsed.error.flatten());
  }

  await connectDB();

  try {
    const since = new Date(Date.now() - parsed.data.days * 86400000);
    const filter: Record<string, unknown> = {
      productId: parsed.data.productId,
      scrapedAt: { $gte: since },
    };
    if (parsed.data.store) filter.store = parsed.data.store;

    const history = await PriceHistory.find(filter)
      .sort({ scrapedAt: -1 })
      .lean();

    const product = await (await import("@/lib/db/models/Product")).Product
      .findById(parsed.data.productId).lean();

    const insights = product
      ? await analyzeHistory(parsed.data.productId, product.currentPrice)
      : null;

    return apiSuccess({ history, insights, total: history.length });
  } catch (error) {
    return apiError("Failed to fetch history", 500);
  }
}
