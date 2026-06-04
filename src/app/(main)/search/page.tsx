"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense, useState } from "react";
import { SearchBar } from "@/components/search/search-bar";
import { useSearch } from "@/hooks/use-search";
import { useSearchStore } from "@/stores/search";
import { AgentSteps } from "@/components/search/agent-steps";
import { PriceComparison } from "@/components/product/price-comparison";
import { RecommendationCard } from "@/components/product/recommendation-card";
import { AISummary } from "@/components/product/ai-summary";
import { PriceInsights } from "@/components/product/price-insights";
import { Loader2, AlertCircle, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const search = useSearch();
  const { result, isSearching, error } = useSearchStore();
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    if (query && !result && !isSearching && !error) {
      search.mutate(query);
    }
  }, [query]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 py-4">
      <SearchBar />

      {isSearching && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Searching across all stores...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {result && (
        <>
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showSteps ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Search completed in {(result.totalDuration / 1000).toFixed(1)}s ({result.steps.length} stages)
          </button>
          {showSteps && <AgentSteps steps={result.steps} />}

          {result.aggregation && result.aggregation.normalizedProducts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-medium text-muted-foreground">
                  {result.aggregation.normalizedProducts.length} listings across {result.aggregation.storeCount} stores
                </h2>
              </div>
              <PriceComparison products={result.aggregation.normalizedProducts} history={result.history} />
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {result.response && <AISummary response={result.response} />}
            </div>
            <div className="space-y-6">
              {result.recommendation && (
                <RecommendationCard recommendation={result.recommendation} />
              )}
              {result.history && <PriceInsights history={result.history} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
