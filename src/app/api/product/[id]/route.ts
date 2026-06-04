import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { Product } from "@/lib/db/models/Product";
import { PriceHistory } from "@/lib/db/models/PriceHistory";
import { Recommendation } from "@/lib/db/models/Recommendation";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await connectDB();

  try {
    const [product, priceHistory, recommendations] = await Promise.all([
      Product.findById(id).lean(),
      PriceHistory.find({ productId: id })
        .sort({ scrapedAt: -1 })
        .limit(365)
        .lean(),
      Recommendation.find({ productId: id })
        .sort({ generatedAt: -1 })
        .limit(1)
        .lean(),
    ]);

    if (!product) {
      return apiError("Product not found", 404);
    }

    return apiSuccess({
      product,
      priceHistory,
      recommendation: recommendations[0] ?? null,
    });
  } catch (error) {
    return apiError("Failed to fetch product", 500);
  }
}
