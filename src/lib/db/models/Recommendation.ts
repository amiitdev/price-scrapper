import mongoose, { type Document, type Model, Schema, Types } from "mongoose";

export interface IRecommendation extends Document {
  productId: Types.ObjectId;
  action: "BUY_NOW" | "WAIT" | "GOOD_DEAL" | "OVERPRICED";
  confidence: number;
  reason: string;
  insights: string[];
  bestPrice: number | null;
  potentialSavings: number | null;
  currentPrice: number;
  lowestPrice30d: number;
  lowestPrice90d: number;
  generatedAt: Date;
  createdAt: Date;
}

const recommendationSchema = new Schema<IRecommendation>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    action: {
      type: String,
      required: true,
      enum: ["BUY_NOW", "WAIT", "GOOD_DEAL", "OVERPRICED"],
    },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    reason: { type: String, required: true },
    insights: [{ type: String }],
    bestPrice: { type: Number, default: null },
    potentialSavings: { type: Number, default: null },
    currentPrice: { type: Number, required: true },
    lowestPrice30d: { type: Number, required: true },
    lowestPrice90d: { type: Number, required: true },
    generatedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

recommendationSchema.index({ productId: 1, generatedAt: -1 });
recommendationSchema.index({ action: 1, generatedAt: -1 });

export const Recommendation: Model<IRecommendation> =
  mongoose.models.Recommendation ??
  mongoose.model<IRecommendation>("Recommendation", recommendationSchema);
