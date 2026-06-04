"use client";

import { useState } from "react";
import { useAnalytics } from "@/hooks/use-analytics";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PriceTrendChart } from "@/components/charts/price-trend";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp } from "lucide-react";

const periods = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
  { label: "180 Days", value: "180d" },
  { label: "365 Days", value: "365d" },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");
  const { data, isLoading } = useAnalytics(period);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Analytics</h1>
        </div>
        <div className="flex gap-1">
          {periods.map((p) => (
            <Button
              key={p.value}
              variant={period === p.value ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p.value)}
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Total Searches" value={data.totalSearches} />
            <MetricCard title="Total Products" value={data.totalProducts} />
            <MetricCard title="Active Alerts" value={data.activeAlerts} />
            <MetricCard title="Period" value={period} />
          </div>

          {data.priceTrend?.length > 0 && (
            <PriceTrendChart
              title="Aggregate Price Trend"
              data={data.priceTrend.map((p: any) => ({
                date: p._id ?? p.date,
                price: p.averagePrice,
              }))}
              days={parseInt(period)}
            />
          )}
        </div>
      )}
    </div>
  );
}
