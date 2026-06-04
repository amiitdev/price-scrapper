"use server";

import { connectDB } from "@/lib/db/mongodb";
import { Alert } from "@/lib/db/models/Alert";
import { alertCreateSchema } from "@/lib/validation/schemas";

export async function createAlert(formData: FormData) {
  const productId = formData.get("productId") as string;
  const type = formData.get("type") as string;
  const targetPrice = parseFloat(formData.get("targetPrice") as string) || undefined;
  const percentageChange =
    parseFloat(formData.get("percentageChange") as string) || undefined;

  const parsed = alertCreateSchema.safeParse({
    productId,
    type,
    targetPrice,
    percentageChange,
  });
  if (!parsed.success) {
    return { error: "Invalid input", details: parsed.error.flatten() };
  }

  await connectDB();
  const alert = await Alert.create({
    userId: "anonymous",
    ...parsed.data,
  });
  return { success: true, data: JSON.parse(JSON.stringify(alert)) };
}

export async function toggleAlert(alertId: string) {
  await connectDB();
  const alert = await Alert.findById(alertId);
  if (!alert) return { error: "Alert not found" };

  alert.isActive = !alert.isActive;
  await alert.save();
  return { success: true, data: JSON.parse(JSON.stringify(alert)) };
}

export async function deleteAlert(alertId: string) {
  await connectDB();
  await Alert.findByIdAndDelete(alertId);
  return { success: true };
}
