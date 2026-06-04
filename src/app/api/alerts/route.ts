import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { Alert } from "@/lib/db/models/Alert";
import { apiSuccess, apiError } from "@/lib/api/response";
import { alertCreateSchema, alertUpdateSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id") ?? "anonymous";
  await connectDB();

  const alerts = await Alert.find({ userId })
    .populate("productId")
    .sort({ createdAt: -1 })
    .lean();
  return apiSuccess(alerts);
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id") ?? "anonymous";
  const body = await req.json();

  const parsed = alertCreateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Invalid input", 400, parsed.error.flatten());
  }

  await connectDB();
  const alert = await Alert.create({
    userId,
    productId: parsed.data.productId,
    type: parsed.data.type,
    targetPrice: parsed.data.targetPrice,
    percentageChange: parsed.data.percentageChange,
  });
  return apiSuccess(alert, 201);
}

export async function PATCH(req: NextRequest) {
  const userId = req.headers.get("x-user-id") ?? "anonymous";
  const body = await req.json();
  const { id, ...update } = body;

  if (!id) return apiError("Alert ID is required", 400);

  const parsed = alertUpdateSchema.safeParse(update);
  if (!parsed.success) {
    return apiError("Invalid input", 400, parsed.error.flatten());
  }

  await connectDB();
  const alert = await Alert.findOneAndUpdate(
    { _id: id, userId },
    { $set: parsed.data },
    { new: true },
  ).lean();

  if (!alert) return apiError("Alert not found", 404);
  return apiSuccess(alert);
}

export async function DELETE(req: NextRequest) {
  const userId = req.headers.get("x-user-id") ?? "anonymous";
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return apiError("Alert ID is required", 400);

  await connectDB();
  const deleted = await Alert.findOneAndDelete({ _id: id, userId });
  if (!deleted) return apiError("Alert not found", 404);
  return apiSuccess({ deleted: true });
}
