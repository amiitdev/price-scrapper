import mongoose, { type Document, type Model, Schema, Types } from "mongoose";

export interface IWatchlist extends Document {
  userId: string;
  name: string;
  description?: string;
  products: Types.ObjectId[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const watchlistSchema = new Schema<IWatchlist>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true },
);

watchlistSchema.index({ userId: 1, createdAt: -1 });
watchlistSchema.index({ name: "text", description: "text" });
watchlistSchema.index({ isPublic: 1, createdAt: -1 });
watchlistSchema.index({ products: 1 });

export const Watchlist: Model<IWatchlist> =
  mongoose.models.Watchlist ??
  mongoose.model<IWatchlist>("Watchlist", watchlistSchema);
