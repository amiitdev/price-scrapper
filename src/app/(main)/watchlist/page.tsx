"use client";

import { useWatchlists, useDeleteWatchlist } from "@/hooks/use-watchlist";
import { useWatchlistStore } from "@/stores/watchlist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, BookmarkCheck, Trash2, Eye } from "lucide-react";
import Link from "next/link";

export default function WatchlistPage() {
  const { data: watchlists, isLoading } = useWatchlists();
  const deleteWatchlist = useDeleteWatchlist();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <BookmarkCheck className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Watchlists</h1>
      </div>

      {!watchlists?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No watchlists yet. Search for products and save them to a watchlist.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {watchlists.map((wl: any) => (
            <Card key={wl._id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">{wl.name}</CardTitle>
                  {wl.description && (
                    <p className="text-sm text-muted-foreground">{wl.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteWatchlist.mutate(wl._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {wl.products?.length ?? 0} products
                  </span>
                  <Link href={`/search`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-3 w-3" /> View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
