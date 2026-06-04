import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { Watchlist } from "@/lib/db/models/Watchlist";
import { apiSuccess, apiError } from "@/lib/api/response";
import { watchlistCreateSchema, watchlistUpdateSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id") ?? "anonymous";
  await connectDB();

  const watchlists = await Watchlist.find({ userId })
    .populate("products")
    .sort({ createdAt: -1 })
    .lean();
  return apiSuccess(watchlists);
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id") ?? "anonymous";
  const body = await req.json();

  const parsed = watchlistCreateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Invalid input", 400, parsed.error.flatten());
  }

  await connectDB();
  const watchlist = await Watchlist.create({
    userId,
    ...parsed.data,
  });
  return apiSuccess(watchlist, 201);
}

export async function PATCH(req: NextRequest) {
  const userId = req.headers.get("x-user-id") ?? "anonymous";
  const body = await req.json();
  const { id, ...update } = body;

  if (!id) return apiError("Watchlist ID is required", 400);

  const parsed = watchlistUpdateSchema.safeParse(update);
  if (!parsed.success) {
    return apiError("Invalid input", 400, parsed.error.flatten());
  }

  await connectDB();
  const watchlist = await Watchlist.findOneAndUpdate(
    { _id: id, userId },
    { $set: parsed.data },
    { new: true },
  ).lean();

  if (!watchlist) return apiError("Watchlist not found", 404);
  return apiSuccess(watchlist);
}

export async function DELETE(req: NextRequest) {
  const userId = req.headers.get("x-user-id") ?? "anonymous";
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return apiError("Watchlist ID is required", 400);

  await connectDB();
  const deleted = await Watchlist.findOneAndDelete({ _id: id, userId });
  if (!deleted) return apiError("Watchlist not found", 404);
  return apiSuccess({ deleted: true });
}
