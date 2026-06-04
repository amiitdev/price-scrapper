import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { SearchHistory } from "@/lib/db/models/SearchHistory";
import { PriceHistory } from "@/lib/db/models/PriceHistory";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "all";

  await connectDB();

  try {
    const [recentSearches, recentPriceChanges] = await Promise.all([
      SearchHistory.find()
        .sort({ createdAt: -1 })
        .limit(type === "searches" ? 20 : 10)
        .lean(),
      type !== "searches"
        ? PriceHistory.aggregate([
            { $sort: { scrapedAt: -1 } },
            {
              $group: {
                _id: "$productId",
                entries: {
                  $push: {
                    price: "$price",
                    scrapedAt: "$scrapedAt",
                    store: "$store",
                    url: "$url",
                  },
                },
              },
            },
            {
              $project: {
                latest: { $arrayElemAt: ["$entries", 0] },
                previous: { $arrayElemAt: ["$entries", 1] },
                trend: {
                  $let: {
                    vars: {
                      curr: { $arrayElemAt: ["$entries.price", 0] },
                      prev: { $arrayElemAt: ["$entries.price", 1] },
                    },
                    in: {
                      $switch: {
                        branches: [
                          { case: { $gt: ["$$curr", "$$prev"] }, then: "up" },
                          { case: { $lt: ["$$curr", "$$prev"] }, then: "down" },
                        ],
                        default: "same",
                      },
                    },
                  },
                },
              },
            },
            {
              $match: { previous: { $ne: null } },
            },
            {
              $addFields: {
                priceChange: { $subtract: ["$latest.price", "$previous.price"] },
                priceChangePercent: {
                  $cond: {
                    if: { $gt: ["$previous.price", 0] },
                    then: {
                      $round: [
                        {
                          $multiply: [
                            {
                              $divide: [
                                { $subtract: ["$latest.price", "$previous.price"] },
                                "$previous.price",
                              ],
                            },
                            100,
                          ],
                        },
                        1,
                      ],
                    },
                    else: 0,
                  },
                },
              },
            },
            { $sort: { "latest.scrapedAt": -1 } },
            { $limit: 15 },
            {
              $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "_id",
                as: "product",
              },
            },
            { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                productName: "$product.name",
                productImage: "$product.imageUrl",
                store: "$latest.store",
                url: "$latest.url",
                scrapedAt: "$latest.scrapedAt",
                currentPrice: "$latest.price",
                previousPrice: "$previous.price",
                previousScrapedAt: "$previous.scrapedAt",
                priceChange: 1,
                priceChangePercent: 1,
                trend: 1,
              },
            },
          ])
        : [],
    ]);

    return apiSuccess({ searches: recentSearches, priceChanges: recentPriceChanges });
  } catch (error) {
    return apiError("Failed to fetch activity", 500);
  }
}
