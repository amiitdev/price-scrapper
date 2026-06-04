import { type NextRequest } from "next/server";
import { searchAllStores } from "@/lib/scrapers";
import { aggregatePrices } from "@/lib/agents/price-aggregation";
import { apiSuccess, apiError } from "@/lib/api/response";
import { compareQuerySchema } from "@/lib/validation/schemas";
import { checkRateLimit } from "@/lib/api/rate-limit";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const rateCheck = await checkRateLimit(`compare:${ip}`);
  if (!rateCheck.success) {
    return apiError("Rate limit exceeded", 429);
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  const parsed = compareQuerySchema.safeParse({ query });
  if (!parsed.success) {
    return apiError("Invalid query", 400, parsed.error.flatten());
  }

  try {
    const rawResults = await searchAllStores(
      { query: parsed.data.query, maxResults: 5 },
    );
    const aggregated = await aggregatePrices(rawResults);
    return apiSuccess(aggregated);
  } catch (error) {
    return apiError("Comparison failed", 500);
  }
}
