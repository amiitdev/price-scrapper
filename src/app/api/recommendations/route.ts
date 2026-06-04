import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { Recommendation } from "@/lib/db/models/Recommendation";
import { Product } from "@/lib/db/models/Product";
import { analyzeHistory } from "@/lib/agents/historical-analysis";
import { generateRecommendation } from "@/lib/agents/recommendation";
import { apiSuccess, apiError } from "@/lib/api/response";
import { recommendationQuerySchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  const parsed = recommendationQuerySchema.safeParse({ productId });
  if (!parsed.success) {
    return apiError("Invalid parameters", 400, parsed.error.flatten());
  }

  await connectDB();

  const existing = await Recommendation.findOne({ productId: parsed.data.productId })
    .sort({ generatedAt: -1 })
    .lean();

  const product = await Product.findById(parsed.data.productId).lean();
  if (!product) return apiError("Product not found", 404);

  if (existing) {
    const history = await analyzeHistory(parsed.data.productId, product.currentPrice);
    return apiSuccess({ recommendation: existing, history });
  }

  const history = await analyzeHistory(parsed.data.productId, product.currentPrice);
  const recommendation = await generateRecommendation(history);

  return apiSuccess({ recommendation, history });
}
