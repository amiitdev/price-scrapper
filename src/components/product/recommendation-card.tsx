"use client";

import type { RecommendationResult } from "@/lib/agents/recommendation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

const actionConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  BUY_NOW: { label: "Buy Now", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: <CheckCircle2 className="h-4 w-4" /> },
  WAIT: { label: "Wait", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: <Clock className="h-4 w-4" /> },
  GOOD_DEAL: { label: "Good Deal", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: <TrendingDown className="h-4 w-4" /> },
  OVERPRICED: { label: "Overpriced", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: <AlertTriangle className="h-4 w-4" /> },
};

export function RecommendationCard({
  recommendation,
}: {
  recommendation: RecommendationResult;
}) {
  const config = actionConfig[recommendation.action] ?? actionConfig.WAIT;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Recommendation</span>
          <Badge variant="outline" className={`text-sm px-3 py-1 ${config.color}`}>
            <span className="flex items-center gap-1.5">
              {config.icon}
              {config.label}
            </span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-muted rounded-full h-2">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${recommendation.confidence}%` }}
            />
          </div>
          <span className="text-sm font-medium">{recommendation.confidence}% confidence</span>
        </div>

        <p className="text-sm text-muted-foreground">{recommendation.reason}</p>

        {recommendation.insights.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Insights
            </p>
            <ul className="space-y-1">
              {recommendation.insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {recommendation.potentialSavings && recommendation.potentialSavings > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span>
              Potential savings: <strong>₹{recommendation.potentialSavings.toLocaleString("en-IN")}</strong>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
