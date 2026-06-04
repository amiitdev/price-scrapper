"use server";

import { connectDB } from "@/lib/db/mongodb";
import { Watchlist } from "@/lib/db/models/Watchlist";
import { watchlistCreateSchema, watchlistUpdateSchema } from "@/lib/validation/schemas";

export async function createWatchlist(formData: FormData) {
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) ?? "";
  const productIdsRaw = (formData.get("productIds") as string) ?? "[]";
  const productIds = JSON.parse(productIdsRaw);

  const parsed = watchlistCreateSchema.safeParse({
    name,
    description,
    productIds,
  });
  if (!parsed.success) {
    return { error: "Invalid input", details: parsed.error.flatten() };
  }

  await connectDB();
  const watchlist = await Watchlist.create({
    userId: "anonymous",
    ...parsed.data,
  });
  return { success: true, data: JSON.parse(JSON.stringify(watchlist)) };
}

export async function addToWatchlist(watchlistId: string, productId: string) {
  await connectDB();
  const watchlist = await Watchlist.findByIdAndUpdate(
    watchlistId,
    { $addToSet: { products: productId } },
    { new: true },
  ).lean();
  if (!watchlist) return { error: "Watchlist not found" };
  return { success: true, data: watchlist };
}

export async function removeFromWatchlist(watchlistId: string, productId: string) {
  await connectDB();
  const watchlist = await Watchlist.findByIdAndUpdate(
    watchlistId,
    { $pull: { products: productId } },
    { new: true },
  ).lean();
  if (!watchlist) return { error: "Watchlist not found" };
  return { success: true, data: watchlist };
}
