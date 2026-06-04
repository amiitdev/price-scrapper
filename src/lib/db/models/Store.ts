import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IStore extends Document {
  name: string;
  slug: string;
  baseUrl: string;
  searchUrl: string;
  logoUrl?: string;
  isActive: boolean;
  scrapeInterval: number;
  lastScrapedAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const storeSchema = new Schema<IStore>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    baseUrl: { type: String, required: true },
    searchUrl: { type: String, required: true },
    logoUrl: { type: String },
    isActive: { type: Boolean, default: true },
    scrapeInterval: { type: Number, default: 3600 },
    lastScrapedAt: { type: Date, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

storeSchema.index({ slug: 1 });
storeSchema.index({ isActive: 1 });

export const Store: Model<IStore> =
  mongoose.models.Store ?? mongoose.model<IStore>("Store", storeSchema);
