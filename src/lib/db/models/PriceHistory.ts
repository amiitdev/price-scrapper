import mongoose, { type Document, type Model, Schema, Types } from "mongoose";

export interface IPriceHistory extends Document {
  productId: Types.ObjectId;
  price: number;
  currency: string;
  store: string;
  url: string;
  available: boolean;
  scrapedAt: Date;
}

const priceHistorySchema = new Schema<IPriceHistory>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    store: { type: String, required: true },
    url: { type: String, required: true },
    available: { type: Boolean, default: true },
    scrapedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: false },
);

priceHistorySchema.index({ productId: 1, scrapedAt: -1 });
priceHistorySchema.index({ store: 1, scrapedAt: -1 });
priceHistorySchema.index({ scrapedAt: -1 });
priceHistorySchema.index({ available: 1, scrapedAt: -1 });
priceHistorySchema.index(
  { productId: 1, scrapedAt: -1 },
  {
    expireAfterSeconds: 7776000,
    name: "price_history_ttl",
    partialFilterExpression: { available: false },
  },
);

export const PriceHistory: Model<IPriceHistory> =
  mongoose.models.PriceHistory ??
  mongoose.model<IPriceHistory>("PriceHistory", priceHistorySchema);
