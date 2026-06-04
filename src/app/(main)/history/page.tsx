"use client";

import { useRecentActivity } from "@/hooks/use-activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, TrendingDown, TrendingUp, Minus, Clock, ExternalLink } from "lucide-react";
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

function formatPrice(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function HistoryPage() {
  const { data, isLoading } = useRecentActivity();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const searches = data?.searches ?? [];
  const priceChanges = data?.priceChanges ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Clock className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">History</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Search className="h-4 w-4" />
            Recent Searches
          </CardTitle>
        </CardHeader>
        <CardContent>
          {searches.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No searches yet. Start searching for products!
            </p>
          ) : (
            <div className="space-y-2">
              {searches.map((s: any) => (
                <Link
                  key={s._id}
                  href={`/search?q=${encodeURIComponent(s.query)}`}
                  className="flex items-center gap-3 rounded-lg border p-3 text-sm hover:bg-accent transition-colors"
                >
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium block truncate">{s.query}</span>
                    <span className="text-xs text-muted-foreground">{s.results} results in {s.stores?.length ?? 0} stores</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {timeAgo(s.createdAt)}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Price Comparison (Past vs Present)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {priceChanges.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No price history yet. Search for products to start tracking prices.
            </p>
          ) : (
            <div className="space-y-3">
              {priceChanges.map((p: any) => (
                <div
                  key={p._id}
                  className="rounded-lg border p-4 text-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {p.productName ?? "Unknown Product"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                        {p.store?.replace(/_/g, " ")} &middot; {timeAgo(p.scrapedAt)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold">{formatPrice(p.currentPrice)}</p>
                      <p className="text-xs text-muted-foreground line-through">
                        {formatPrice(p.previousPrice)}
                      </p>
                    </div>
                  </div>

                  {p.priceChangePercent !== 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      {p.trend === "down" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                          <TrendingDown className="h-3 w-3" />
                          Dropped {Math.abs(p.priceChangePercent)}%
                        </span>
                      ) : p.trend === "up" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-500">
                          <TrendingUp className="h-3 w-3" />
                          Increased {p.priceChangePercent}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          <Minus className="h-3 w-3" />
                          No change
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatPrice(p.previousPrice)} → {formatPrice(p.currentPrice)}
                      </span>
                    </div>
                  )}

                  {p.previousScrapedAt && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Compared from {timeAgo(p.previousScrapedAt)}
                    </p>
                  )}

                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      View on store <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
