import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IProduct extends Document {
  url: string;
  name: string;
  description?: string;
  brand?: string;
  currentPrice: number;
  currency: string;
  store: string;
  imageUrl?: string;
  category?: string;
  sku?: string;
  upc?: string;
  isActive: boolean;
  lastScrapedAt: Date | null;
  metadata: Map<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    url: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    brand: { type: String },
    currentPrice: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    store: { type: String, required: true, index: true },
    imageUrl: { type: String },
    category: { type: String },
    sku: { type: String },
    upc: { type: String },
    isActive: { type: Boolean, default: true },
    lastScrapedAt: { type: Date, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", description: "text", brand: "text" });
productSchema.index({ store: 1, isActive: 1 });
productSchema.index({ category: 1, currentPrice: 1 });
productSchema.index({ sku: 1 }, { sparse: true });
productSchema.index({ upc: 1 }, { sparse: true });
productSchema.index({ updatedAt: -1 });

export const Product: Model<IProduct> =
  mongoose.models.Product ?? mongoose.model<IProduct>("Product", productSchema);
