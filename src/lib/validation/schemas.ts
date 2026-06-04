import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().min(1, "Search query is required").max(500),
  store: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export const alertCreateSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(["price_drop", "price_increase", "target_price", "in_stock", "flash_sale"]),
  targetPrice: z.number().min(0).optional(),
  percentageChange: z.number().min(0).max(100).optional(),
});

export const alertUpdateSchema = alertCreateSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const watchlistCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false),
  productIds: z.array(z.string()).min(1).default([]),
});

export const watchlistUpdateSchema = watchlistCreateSchema.partial();

export const productSearchSchema = z.object({
  query: z.string().min(1).max(500),
  stores: z.array(z.string()).optional(),
  maxResults: z.coerce.number().int().min(1).max(50).default(10),
});

export const priceHistoryQuerySchema = z.object({
  productId: z.string().min(1),
  days: z.coerce.number().int().min(1).max(365).default(30),
  store: z.string().optional(),
});

export const analyticsQuerySchema = z.object({
  period: z.enum(["7d", "30d", "90d", "180d", "365d"]).default("30d"),
  store: z.string().optional(),
  category: z.string().optional(),
});

export const recommendationQuerySchema = z.object({
  productId: z.string().min(1),
});

export const compareQuerySchema = z.object({
  query: z.string().min(1).max(500),
});
