"use client";

import type { HistoricalInsights } from "@/lib/agents/historical-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function PriceInsights({ history }: { history: HistoricalInsights }) {
  const TrendIcon = history.trend === "up" ? TrendingUp : history.trend === "down" ? TrendingDown : Minus;
  const trendColor = history.trend === "up" ? "text-red-400" : history.trend === "down" ? "text-emerald-400" : "text-muted-foreground";

  const stats = [
    { label: "Current", value: `₹${history.currentPrice.toLocaleString("en-IN")}` },
    { label: "90-day Low", value: `₹${history.lowestPrice.toLocaleString("en-IN")}` },
    { label: "90-day High", value: `₹${history.highestPrice.toLocaleString("en-IN")}` },
    { label: "90-day Avg", value: `₹${history.averagePrice.toLocaleString("en-IN")}` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <TrendIcon className={`h-4 w-4 ${trendColor}`} />
          Price Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">7-day change</span>
            <span className={history.sevenDayChange > 0 ? "text-red-400" : "text-emerald-400"}>
              {history.sevenDayChange > 0 ? "+" : ""}{history.sevenDayChange.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">30-day change</span>
            <span className={history.thirtyDayChange > 0 ? "text-red-400" : "text-emerald-400"}>
              {history.thirtyDayChange > 0 ? "+" : ""}{history.thirtyDayChange.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Volatility</span>
            <span>₹{history.volatility.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{history.summary}</p>
      </CardContent>
    </Card>
  );
}
