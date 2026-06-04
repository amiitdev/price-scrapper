import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IAnalytics extends Document {
  type: "daily" | "weekly" | "monthly";
  period: string;
  data: {
    totalSearches: number;
    totalProducts: number;
    totalPriceDrops: number;
    averagePrice: number;
    mostSearchedBrand: string;
    mostSearchedCategory: string;
    topStores: Array<{ store: string; count: number }>;
    priceTrend: Array<{ date: string; averagePrice: number; productCount: number }>;
  };
  generatedAt: Date;
  createdAt: Date;
}

const analyticsSchema = new Schema<IAnalytics>(
  {
    type: {
      type: String,
      required: true,
      enum: ["daily", "weekly", "monthly"],
    },
    period: { type: String, required: true },
    data: {
      totalSearches: { type: Number, default: 0 },
      totalProducts: { type: Number, default: 0 },
      totalPriceDrops: { type: Number, default: 0 },
      averagePrice: { type: Number, default: 0 },
      mostSearchedBrand: { type: String },
      mostSearchedCategory: { type: String },
      topStores: [
        {
          store: { type: String },
          count: { type: Number },
        },
      ],
      priceTrend: [
        {
          date: { type: String },
          averagePrice: { type: Number },
          productCount: { type: Number },
        },
      ],
    },
    generatedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

analyticsSchema.index({ type: 1, period: 1 }, { unique: true });
analyticsSchema.index({ generatedAt: -1 });

export const Analytics: Model<IAnalytics> =
  mongoose.models.Analytics ?? mongoose.model<IAnalytics>("Analytics", analyticsSchema);
