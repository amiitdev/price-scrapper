import mongoose, { type Document, type Model, Schema, Types } from "mongoose";

export interface ISearchHistory extends Document {
  userId: string | null;
  query: string;
  results: number;
  parsedProduct: {
    brand?: string;
    product?: string;
    storage?: string;
    color?: string;
    category?: string;
  };
  stores: string[];
  duration: number;
  createdAt: Date;
}

const searchHistorySchema = new Schema<ISearchHistory>(
  {
    userId: { type: String, default: null, index: true },
    query: { type: String, required: true },
    results: { type: Number, default: 0 },
    parsedProduct: {
      brand: { type: String },
      product: { type: String },
      storage: { type: String },
      color: { type: String },
      category: { type: String },
    },
    stores: [{ type: String }],
    duration: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

searchHistorySchema.index({ createdAt: -1 });
searchHistorySchema.index({ query: "text" });
searchHistorySchema.index({ userId: 1, createdAt: -1 });

export const SearchHistory: Model<ISearchHistory> =
  mongoose.models.SearchHistory ??
  mongoose.model<ISearchHistory>("SearchHistory", searchHistorySchema);
