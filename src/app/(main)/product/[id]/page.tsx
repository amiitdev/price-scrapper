"use client";

import { use } from "react";
import { useProduct, usePriceHistory, useRecommendation } from "@/hooks/use-product";
import { PriceComparison } from "@/components/product/price-comparison";
import { RecommendationCard } from "@/components/product/recommendation-card";
import { PriceInsights } from "@/components/product/price-insights";
import { PriceTrendChart } from "@/components/charts/price-trend";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useProduct(id);
  const { data: historyData } = usePriceHistory(id, 90);
  const { data: recommendationData } = useRecommendation(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Product not found</p>
        <Link href="/">
          <Button variant="link" className="mt-2">Go home</Button>
        </Link>
      </div>
    );
  }

  const { product, priceHistory, recommendation } = data;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link href="/search">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </Link>

      <div className="flex items-start gap-6">
        {product.imageUrl && (
          <div className="shrink-0 rounded-xl border bg-card p-4">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-40 w-40 object-contain"
            />
          </div>
        )}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-4xl font-bold text-primary">
            ₹{product.currentPrice?.toLocaleString("en-IN") ?? "N/A"}
          </p>
          <p className="text-sm text-muted-foreground">
            Last scraped: {product.lastScrapedAt ? new Date(product.lastScrapedAt).toLocaleDateString() : "N/A"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {priceHistory && (
            <PriceTrendChart
              data={priceHistory.map((p: any) => ({ date: p.scrapedAt, price: p.price }))}
              days={90}
            />
          )}
        </div>
        <div className="space-y-6">
          {recommendation && <RecommendationCard recommendation={recommendation} />}
          {historyData?.insights && <PriceInsights history={historyData.insights} />}
        </div>
      </div>
    </div>
  );
}
