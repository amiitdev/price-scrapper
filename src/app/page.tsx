"use client";

import Link from "next/link";
import { SearchBar } from "@/components/search/search-bar";
import { useSearchStore } from "@/stores/search";
import { AgentSteps } from "@/components/search/agent-steps";
import { PriceComparison } from "@/components/product/price-comparison";
import { RecommendationCard } from "@/components/product/recommendation-card";
import { AISummary } from "@/components/product/ai-summary";
import { PriceInsights } from "@/components/product/price-insights";
import { MainLayout } from "@/components/layout/main-layout";
import { Sparkles, TrendingUp, Zap, Shield, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

function HomeContent() {
  const { result, isSearching } = useSearchStore();
  const [showSteps, setShowSteps] = useState(false);

  if (result) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 py-8">
        <SearchBar />

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
            <PriceComparison products={result.aggregation.normalizedProducts} />
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
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl py-12">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI-Powered Price Intelligence
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Find the Best Price
          <br />
          <span className="text-primary">with AI</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Search across Amazon, Flipkart, Reliance Digital and more. Get AI-driven buying recommendations
          and price history insights.
        </p>
      </div>

      <SearchBar autoFocus />

      <div className="mt-16 grid gap-6 sm:grid-cols-3">
        {[
          { icon: Zap, title: "Multi-Store Search", desc: "Search 7 Indian stores simultaneously" },
          { icon: TrendingUp, title: "Price History", desc: "Track trends over 7, 30, 90, and 365 days" },
          { icon: Shield, title: "AI Recommendations", desc: "Smart Buy Now or Wait decisions" },
        ].map((feature) => (
          <div key={feature.title} className="rounded-xl border bg-card/50 p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <feature.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground mb-4">Try these searches:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {["Samsung S25 Ultra", "iPhone 16 Pro", "RTX 5070", "Laptop under 80000"].map((q) => (
            <Link
              key={q}
              href={`/search?q=${encodeURIComponent(q)}`}
              className="inline-flex items-center gap-1 rounded-full border bg-muted/30 px-3 py-1.5 text-sm hover:bg-accent transition-colors"
            >
              {q}
              <ArrowRight className="h-3 w-3" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <MainLayout>
      <HomeContent />
    </MainLayout>
  );
}
