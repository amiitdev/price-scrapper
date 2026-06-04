"use client";

import { use, useState } from "react";
import { usePriceHistory } from "@/hooks/use-product";
import { PriceTrendChart } from "@/components/charts/price-trend";
import { PriceInsights } from "@/components/product/price-insights";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const presets = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "180D", days: 180 },
  { label: "365D", days: 365 },
];

export default function PriceHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [days, setDays] = useState(90);
  const { data, isLoading } = usePriceHistory(id, days);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Price History</h1>
        <div className="flex gap-1">
          {presets.map((p) => (
            <Button
              key={p.label}
              variant={days === p.days ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(p.days)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <PriceTrendChart
            data={data.history?.map((p: any) => ({ date: p.scrapedAt, price: p.price })) ?? []}
            days={days}
          />
          {data.insights && <PriceInsights history={data.insights} />}
        </div>
      )}
    </div>
  );
}
