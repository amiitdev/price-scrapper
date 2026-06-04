import mongoose, { type Document, type Model, Schema, Types } from "mongoose";

export type AlertType = "price_drop" | "price_increase" | "target_price" | "in_stock";

export interface IAlert extends Document {
  userId: string;
  productId: Types.ObjectId;
  type: AlertType;
  targetPrice?: number;
  percentageChange?: number;
  isActive: boolean;
  triggeredCount: number;
  lastTriggeredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<IAlert>(
  {
    userId: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    type: {
      type: String,
      required: true,
      enum: ["price_drop", "price_increase", "target_price", "in_stock"],
    },
    targetPrice: { type: Number },
    percentageChange: { type: Number },
    isActive: { type: Boolean, default: true },
    triggeredCount: { type: Number, default: 0 },
    lastTriggeredAt: { type: Date, default: null },
  },
  { timestamps: true },
);

alertSchema.index({ userId: 1, isActive: 1 });
alertSchema.index({ productId: 1, type: 1 });
alertSchema.index({ userId: 1, type: 1, isActive: 1 });
alertSchema.index({ lastTriggeredAt: -1 }, { sparse: true });

export const Alert: Model<IAlert> =
  mongoose.models.Alert ?? mongoose.model<IAlert>("Alert", alertSchema);
