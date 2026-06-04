"use client";

import { useMemo } from "react";
import type { NormalizedProduct } from "@/lib/agents/price-aggregation";
import type { HistoricalInsights } from "@/lib/agents/historical-analysis";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, IndianRupee, ShoppingCart, ImageOff, TrendingDown, TrendingUp, BarChart3 } from "lucide-react";
import Link from "next/link";

interface ProductGroup {
  name: string;
  imageUrl: string | null;
  stores: NormalizedProduct[];
  lowestPrice: number;
  highestPrice: number;
  bestMatch: boolean;
  productId?: string;
}

const storeLabels: Record<string, { label: string; color: string }> = {
  amazon: { label: "Amazon", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  flipkart: { label: "Flipkart", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  reliance_digital: { label: "Reliance Digital", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
};

function groupProducts(products: NormalizedProduct[]): ProductGroup[] {
  const groups = new Map<string, NormalizedProduct[]>();

  for (const p of products) {
    const key = p.name.toLowerCase().replace(/\s+/g, " ").trim();
    const existing = groups.get(key) ?? [];
    existing.push(p);
    groups.set(key, existing);
  }

  return Array.from(groups.entries()).map(([, items]) => {
    const bestImg = items.find((i) => i.imageUrl)?.imageUrl ?? null;
    const prices = items.map((i) => i.price);
    const best = items.find((i) => i.bestMatch) ?? items[0];
    return {
      name: items[0].name,
      imageUrl: bestImg,
      stores: items.sort((a, b) => a.price - b.price),
      lowestPrice: Math.min(...prices),
      highestPrice: Math.max(...prices),
      bestMatch: items.some((i) => i.bestMatch),
      productId: best.productId,
    };
  });
}

function ProductCard({
  group,
  history,
}: {
  group: ProductGroup;
  history?: HistoricalInsights | null;
}) {
  return (
    <div className="group flex flex-col rounded-xl border bg-card transition-all hover:shadow-md hover:border-primary/20 overflow-hidden">
      <div className="relative flex h-48 items-center justify-center bg-muted/30 p-6">
        {group.imageUrl ? (
          <img
            src={group.imageUrl}
            alt={group.name}
            className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageOff className="h-8 w-8" />
            <span className="text-xs">No image</span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {group.bestMatch && (
            <Badge variant="success" className="text-[10px] px-2">
              Best Price
            </Badge>
          )}
          {group.productId && history && (
            <Badge
              variant="outline"
              className={`text-[10px] px-2 ${
                history.thirtyDayChange < 0
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : history.thirtyDayChange > 0
                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {history.thirtyDayChange < 0 ? (
                <span className="flex items-center gap-0.5"><TrendingDown className="h-3 w-3" /> {Math.abs(history.thirtyDayChange).toFixed(1)}%</span>
              ) : history.thirtyDayChange > 0 ? (
                <span className="flex items-center gap-0.5"><TrendingUp className="h-3 w-3" /> +{history.thirtyDayChange.toFixed(1)}%</span>
              ) : (
                "No change"
              )}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 pt-3">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug mb-2 min-h-[2.5em]">
          {group.name}
        </h3>

        <div className="flex items-baseline gap-1.5 mb-3">
          <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xl font-bold text-emerald-400">
            {group.lowestPrice.toLocaleString("en-IN")}
          </span>
          {group.highestPrice > group.lowestPrice && (
            <span className="text-xs text-muted-foreground line-through">
              ₹{group.highestPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {group.productId && (
          <Link
            href={`/product/${group.productId}`}
            className="mb-3 flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary hover:bg-primary/10 transition-colors"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>View Price History</span>
            <span className="ml-auto text-muted-foreground">
              {history ? `₹${history.lowestPrice.toLocaleString("en-IN")} – ₹${history.highestPrice.toLocaleString("en-IN")}` : ""}
            </span>
          </Link>
        )}

        <div className="mt-auto space-y-1.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            Buy from
          </p>
          {group.stores.map((item) => {
            const store = storeLabels[item.store] ?? { label: item.store, color: "bg-muted text-muted-foreground border-border" };
            return (
              <a
                key={item.store}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-xs transition-colors hover:bg-accent/50 hover:border-border group/store"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 leading-4 ${store.color}`}>
                    {store.label}
                  </Badge>
                  <span className="text-muted-foreground truncate hidden sm:inline">
                    {item.seller}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold tabular-nums">
                    ₹{item.price.toLocaleString("en-IN")}
                  </span>
                  {item.discount > 0 && (
                    <span className="text-emerald-400 font-medium">-{item.discount}%</span>
                  )}
                  <ExternalLink className="h-3 w-3 text-muted-foreground/50 group-hover/store:text-muted-foreground transition-colors" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function PriceComparison({
  products,
  history,
}: {
  products: NormalizedProduct[];
  history?: HistoricalInsights | null;
}) {
  const groups = useMemo(() => groupProducts(products), [products]);

  if (!groups.length) {
    return (
      <div className="rounded-xl border bg-card/50 p-12 text-center">
        <ShoppingCart className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group, i) => (
        <ProductCard key={`${group.name}-${i}`} group={group} history={history} />
      ))}
    </div>
  );
}
