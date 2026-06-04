"use client";

import { useDashboard } from "@/hooks/use-analytics";
import { useRecentActivity } from "@/hooks/use-activity";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PriceTrendChart } from "@/components/charts/price-trend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShoppingBag, TrendingDown, TrendingUp, Bell, Search, Minus, SearchX } from "lucide-react";
import Link from "next/link";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const { data: activity } = useRecentActivity();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = data?.stats;
  const searches = activity?.searches ?? [];
  const priceChanges = activity?.priceChanges ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Products"
          value={stats?.totalProducts ?? 0}
          icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Price Drops Today"
          value={stats?.totalPriceDrops ?? 0}
          icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Active Alerts"
          value={stats?.activeAlerts ?? 0}
          icon={<Bell className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Total Searches"
          value={stats?.totalSearches ?? 0}
          icon={<Search className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Price Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              {stats?.priceTrend?.length ? (
                <PriceTrendChart
                  data={stats.priceTrend.map((p: any) => ({
                    date: p.date ?? p._id,
                    price: p.averagePrice,
                  }))}
                />
              ) : (
                "No trend data available"
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {searches.length === 0 && priceChanges.length === 0 ? (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                  <SearchX className="h-4 w-4 mr-2" />
                  No activity yet
                </div>
              ) : (
                <>
                  {searches.slice(0, 5).map((s: any) => (
                    <Link
                      key={s._id}
                      href={`/search?q=${encodeURIComponent(s.query)}`}
                      className="flex items-center gap-3 rounded-lg p-2 text-sm hover:bg-accent transition-colors"
                    >
                      <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate">{s.query}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {s.results} results
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {timeAgo(s.createdAt)}
                      </span>
                    </Link>
                  ))}
                  {priceChanges.slice(0, 3).map((p: any) => (
                    <div
                      key={p._id}
                      className="rounded-lg border p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">{p.productName ?? "Product"}</span>
                        <span className="font-semibold shrink-0">
                          ₹{p.currentPrice?.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        {p.trend === "down" ? (
                          <span className="inline-flex items-center gap-0.5 text-xs text-emerald-500">
                            <TrendingDown className="h-3 w-3" />
                            {Math.abs(p.priceChangePercent)}%
                          </span>
                        ) : p.trend === "up" ? (
                          <span className="inline-flex items-center gap-0.5 text-xs text-red-500">
                            <TrendingUp className="h-3 w-3" />
                            {p.priceChangePercent}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                            <Minus className="h-3 w-3" />0%
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground line-through">
                          ₹{p.previousPrice?.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {timeAgo(p.scrapedAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
